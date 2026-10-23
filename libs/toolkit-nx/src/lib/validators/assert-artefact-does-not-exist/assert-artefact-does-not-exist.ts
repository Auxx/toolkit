import { Tree } from '@nx/devkit';
import { ComponentType, getComponentClassSuffix } from '../../component-types/component-types';
import { componentPath } from '../../path-helper/path-helper';

export function assertArtefactDoesNotExist(
  tree: Tree,
  project: string,
  feature: string,
  name: string,
  type: ComponentType
) {
  const path = componentPath(tree, project, feature, name, type);

  if (tree.exists(path)) {
    throw new Error(`${getComponentClassSuffix(type)} "${name}" already exists in feature "${feature}" (${path}).`);
  }

  return true;
}
