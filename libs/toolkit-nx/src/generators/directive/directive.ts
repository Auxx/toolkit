import { generateFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import { createSelector, getComponentClassSuffix, getComponentSuffix } from '../../lib/component-types/component-types';
import { componentPath } from '../../lib/path-helper/path-helper';
import { assertFeatureExists } from '../../lib/validators/assert-feature-exists/assert-feature-exists';
import { DirectiveGeneratorSchema } from './directive-schema';

export async function directiveGenerator(tree: Tree, options: DirectiveGeneratorSchema) {
  assertFeatureExists(tree, options.project, options.feature);

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
