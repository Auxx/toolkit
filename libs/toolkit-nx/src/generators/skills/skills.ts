import {generateFiles, joinPathFragments, Tree} from '@nx/devkit';
import {SkillsGeneratorSchema} from "./skills-schema";

export async function skillsGenerator(tree: Tree, options: SkillsGeneratorSchema) {
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    '/.agents/skills',
    {}
  );
}

export default skillsGenerator;
