import { generateFiles, joinPathFragments, Tree } from '@nx/devkit';
import { SkillsGeneratorSchema } from './skills-schema';

const knownSkills = [ 'toolkit-nx', 'workspace' ];

export async function skillsGenerator(tree: Tree, _options: SkillsGeneratorSchema) {
  const source = joinPathFragments(__dirname, 'files');
  const agentsTarget = '/.agents/skills';
  const claudeTarget = '/.claude/skills';

  knownSkills.forEach(skill => {
    tree.delete(joinPathFragments(agentsTarget, skill));
    tree.delete(joinPathFragments(claudeTarget, skill));

    generateFiles(
      tree,
      joinPathFragments(source, skill),
      joinPathFragments(agentsTarget, skill),
      {}
    );

    generateFiles(
      tree,
      joinPathFragments(source, skill),
      joinPathFragments(claudeTarget, skill),
      {}
    );
  });
}

export default skillsGenerator;
