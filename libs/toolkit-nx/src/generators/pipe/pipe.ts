import { generateFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import { getComponentClassSuffix, getComponentSuffix } from '../../lib/component-types/component-types';
import { componentPath } from '../../lib/path-helper/path-helper';
import { assertFeatureExists } from '../../lib/validators/assert-feature-exists/assert-feature-exists';
import { PipeGeneratorSchema } from './pipe-schema';

export async function pipeGenerator(tree: Tree, options: PipeGeneratorSchema) {
  assertFeatureExists(tree, options.project, options.feature);

  const targetPath = componentPath(tree, options.project, options.feature, options.name, 'pipe');
  const artifact = names(options.name);

  const entityName = artifact.className;
  const className = `${artifact.className}${getComponentClassSuffix('pipe')}`;
  const fileName = `${artifact.fileName}.${getComponentSuffix('pipe')}`;
  const pipeName = artifact.propertyName;

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    targetPath,
    {
      entityName,
      className,
      fileName,
      pipeName
    }
  );
}

export default pipeGenerator;
