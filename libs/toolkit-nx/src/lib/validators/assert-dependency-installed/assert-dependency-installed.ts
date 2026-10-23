import { getDependencyVersionFromPackageJson, Tree } from '@nx/devkit';

export function assertDependencyInstalled(tree: Tree, dependency: string, reason: string) {
  if (getDependencyVersionFromPackageJson(tree, dependency) === null) {
    throw new Error(`Dependency "${dependency}" is not installed. It is required for ${reason}.`);
  }

  return true;
}
