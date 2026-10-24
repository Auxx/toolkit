import { generateFiles, joinPathFragments, Tree } from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { htmlCommentMarkers, upsertTextBlock } from '../../lib/text-block/text-block';
import { SkillsGeneratorSchema } from './skills-schema';

const knownSkills = [ 'toolkit-nx', 'workspace', 'development-workflow' ];

const skillsTargets = [ '/.agents/skills', '/.claude/skills' ];

const instructionsTargets = [ '/AGENTS.md', '/CLAUDE.md' ];

const instructionsMarkers = htmlCommentMarkers('@hexmode/toolkit-nx');

export async function skillsGenerator(tree: Tree, _options: SkillsGeneratorSchema) {
  const source = joinPathFragments(__dirname, 'files');
  const instructions = readFileSync(joinPathFragments(source, 'instructions.md'), 'utf-8');

  skillsTargets.forEach(target => {
    knownSkills.forEach(skill => deleteRecursively(tree, joinPathFragments(target, skill)));
    generateFiles(tree, joinPathFragments(source, 'skills'), target, {});
  });

  instructionsTargets.forEach(target => {
    const content = tree.read(target, 'utf-8') ?? '';
    tree.write(target, upsertTextBlock(content, instructions, instructionsMarkers));
  });
}

// Tree.delete() on a directory does not delete files that exist only on disk once something is written into it again.
function deleteRecursively(tree: Tree, path: string) {
  tree.children(path).forEach(child => deleteRecursively(tree, joinPathFragments(path, child)));
  tree.delete(path);
}

export default skillsGenerator;
