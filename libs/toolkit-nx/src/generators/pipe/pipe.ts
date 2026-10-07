import { generateFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import { getComponentClassSuffix, getComponentSuffix } from '../../lib/component-types/component-types';
import { componentPath, featurePath } from '../../lib/path-helper/path-helper';
import { PipeGeneratorSchema } from './pipe-schema';

export async function pipeGenerator(tree: Tree, options: PipeGeneratorSchema) {
  const feature = featurePath(tree, options.project, options.feature);
  if (!tree.exists(feature) || tree.isFile(feature)) {
    console.log(`Feature "${options.feature}" does not exist.`);
    return;
  }

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
