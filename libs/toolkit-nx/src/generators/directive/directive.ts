import { generateFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import { createSelector, getComponentClassSuffix, getComponentSuffix } from '../../lib/component-types/component-types';
import { componentPath, featurePath } from '../../lib/path-helper/path-helper';
import { DirectiveGeneratorSchema } from './directive-schema';

export async function directiveGenerator(tree: Tree, options: DirectiveGeneratorSchema) {
  const feature = featurePath(tree, options.project, options.feature);
  if (!tree.exists(feature) || tree.isFile(feature)) {
    console.log(`Feature "${options.feature}" does not exist.`);
    return;
  }

  const targetPath = componentPath(tree, options.project, options.feature, options.name, 'directive');
  const artifact = names(options.name);

  const entityName = artifact.className;
  const className = `${artifact.className}${getComponentClassSuffix('directive')}`;
  const fileName = `${artifact.fileName}.${getComponentSuffix('directive')}`;
  const selector = createSelector(tree, options.project, options.name, true);

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    targetPath,
    {
      entityName,
      className,
      fileName,
      selector
    }
  );
}

export default directiveGenerator;
