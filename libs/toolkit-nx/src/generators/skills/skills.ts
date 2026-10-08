import { generateFiles, joinPathFragments, Tree } from '@nx/devkit';
import { SkillsGeneratorSchema } from './skills-schema';

const knownSkills = [ 'toolkit-nx', 'workspace', 'development-workflow' ];

export async function skillsGenerator(tree: Tree, _options: SkillsGeneratorSchema) {
  const source = joinPathFragments(__dirname, 'files');
  const agents = '/.agents';
  const claude = '/.claude';
  const agentsSkills = joinPathFragments(agents, 'skills');
  const claudeSkills = joinPathFragments(claude, 'skills');

  knownSkills.forEach(skill => {
    tree.delete(joinPathFragments(agentsSkills, skill));
    tree.delete(joinPathFragments(claudeSkills, skill));
  });

  generateFiles(
    tree,
    source,
    agents,
    {}
  );

  generateFiles(
    tree,
    source,
    claude,
    {}
  );

  tree.rename(joinPathFragments(claude, 'AGENTS.md'), joinPathFragments(claude, 'CLAUDE.md'));
}

export default skillsGenerator;
