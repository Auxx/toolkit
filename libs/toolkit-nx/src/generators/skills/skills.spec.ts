import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
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

    expect(tree.children(agentsTarget).length).toBe(2);
    expect(tree.exists(`${agentsTarget}/toolkit-nx/SKILL.md`)).toBe(true);
    expect(tree.children(`${agentsTarget}/toolkit-nx/references`).length).toBe(6);
    expect(tree.exists(`${agentsTarget}/workspace/SKILL.md`)).toBe(true);

    expect(tree.children(claudeTarget).length).toBe(2);
    expect(tree.exists(`${claudeTarget}/toolkit-nx/SKILL.md`)).toBe(true);
    expect(tree.children(`${claudeTarget}/toolkit-nx/references`).length).toBe(6);
    expect(tree.exists(`${claudeTarget}/workspace/SKILL.md`)).toBe(true);
  });
});
