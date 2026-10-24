import { Tree } from '@nx/devkit';
import { featurePath } from '../../path-helper/path-helper';

export function assertFeatureDoesNotExist(tree: Tree, project: string, feature: string) {
  const path = featurePath(tree, project, feature);

  if (tree.exists(path) && !tree.isFile(path)) {
    throw new Error(`Feature "${feature}" already exists.`);
  }

  return true;
}
