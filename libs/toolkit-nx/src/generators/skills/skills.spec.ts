import { addProjectConfiguration, Tree } from '@nx/devkit';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import { FsTree } from 'nx/src/generators/tree';
import skillsGenerator from './skills';

describe('Skills Generator', () => {
  let tree: Tree;

  const appName = 'front-end';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    addProjectConfiguration(
      tree,
      appName,
      {
        projectType: 'application',
        root: `apps/${appName}`,
        sourceRoot: `apps/${appName}/src`
      }
    );
  });

  it('should create skills', async () => {
    await skillsGenerator(tree, { unused: undefined });

    const agentsTarget = '/.agents/skills';
    const claudeTarget = '/.claude/skills';

    expect(tree.exists('/.agents/AGENTS.md')).toBe(false);
    expect(tree.exists('/.claude/CLAUDE.md')).toBe(false);
    expect(tree.exists('/.agents/skills/instructions.md')).toBe(false);

    expect(tree.children(agentsTarget).length).toBe(3);
    expect(tree.exists(`${agentsTarget}/toolkit-nx/SKILL.md`)).toBe(true);
    expect(tree.children(`${agentsTarget}/toolkit-nx/references`).length).toBe(3);
    expect(tree.exists(`${agentsTarget}/workspace/SKILL.md`)).toBe(true);
    expect(tree.exists(`${agentsTarget}/development-workflow/SKILL.md`)).toBe(true);

    expect(tree.children(claudeTarget).length).toBe(3);
    expect(tree.exists(`${claudeTarget}/toolkit-nx/SKILL.md`)).toBe(true);
    expect(tree.children(`${claudeTarget}/toolkit-nx/references`).length).toBe(3);
    expect(tree.exists(`${claudeTarget}/workspace/SKILL.md`)).toBe(true);
    expect(tree.exists(`${claudeTarget}/development-workflow/SKILL.md`)).toBe(true);
  });

  it('should remove files that no longer exist in the source from the installed skills', async () => {
    const root = mkdtempSync(join(tmpdir(), 'skills-'));

    try {
      const staleDir = join(root, '.claude/skills/toolkit-nx/references');
      mkdirSync(staleDir, { recursive: true });
      writeFileSync(join(staleDir, 'obsolete.md'), 'Outdated reference');
      writeFileSync(join(root, '.claude/skills/custom.md'), 'Not a toolkit skill');

      const fsTree = new FsTree(root, false);
      await skillsGenerator(fsTree, { unused: undefined });

      expect(fsTree.exists('.claude/skills/toolkit-nx/references/obsolete.md')).toBe(false);
      expect(fsTree.exists('.claude/skills/toolkit-nx/SKILL.md')).toBe(true);
      expect(fsTree.exists('.claude/skills/custom.md')).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  describe.each`
    file
    ${'AGENTS.md'}
    ${'CLAUDE.md'}
  `('$file in the workspace root', ({ file }) => {
    const start = '<!-- @hexmode/toolkit-nx:start -->';
    const end = '<!-- @hexmode/toolkit-nx:end -->';

    const read = () => tree.read(file, 'utf-8') ?? '';

    it('should be created with the instructions block', async () => {
      await skillsGenerator(tree, { unused: undefined });

      expect(read().startsWith(`${start}\n\n`)).toBe(true);
      expect(read()).toContain('load the `development-workflow` skill');
      expect(read().trimEnd().endsWith(end)).toBe(true);
    });

    it('should keep existing content and append the instructions block', async () => {
      tree.write(file, '# Project rules\n\nUse tabs.\n');

      await skillsGenerator(tree, { unused: undefined });

      expect(read().startsWith('# Project rules\n\nUse tabs.\n\n' + start)).toBe(true);
      expect(read()).toContain('load the `development-workflow` skill');
    });

    it('should replace only the instructions block on re-run', async () => {
      tree.write(file, `# Before\n\n${start}\nOutdated instructions\n${end}\n\n# After\n`);

      await skillsGenerator(tree, { unused: undefined });
      const once = read();
      await skillsGenerator(tree, { unused: undefined });

      expect(read()).toBe(once);
      expect(once).not.toContain('Outdated instructions');
      expect(once.startsWith(`# Before\n\n${start}\n\n`)).toBe(true);
      expect(once.endsWith(`\n\n${end}\n\n# After\n`)).toBe(true);
      expect(once.split(start).length).toBe(2);
    });

    it('should fail without changes if the block markers are malformed', async () => {
      const content = `# Rules\n\n${start}\nNo end marker\n`;
      tree.write(file, content);

      await expect(() => skillsGenerator(tree, { unused: undefined })).rejects.toThrow('Malformed block');

      expect(read()).toBe(content);
    });
  });
});
