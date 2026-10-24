import { Tree } from '@nx/devkit';
import { featurePath } from '../../path-helper/path-helper';

export function assertFeatureExists(tree: Tree, project: string, feature: string) {
  const path = featurePath(tree, project, feature);

  if (!tree.exists(path) || tree.isFile(path)) {
    throw new Error(`Feature "${feature}" does not exist.`);
  }

  return true;
}
