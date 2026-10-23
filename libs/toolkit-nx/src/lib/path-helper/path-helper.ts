import { joinPathFragments, names, readProjectConfiguration, Tree } from '@nx/devkit';
import { ComponentType, getComponentFolder } from '../component-types/component-types';

export function toKebabCase(name: string): string {
  return names(name).fileName;
}

export function projectPath(tree: Tree, projectName: string): string {
  return readProjectConfiguration(tree, projectName).root;
}

export function projectSrcPath(tree: Tree, projectName: string): string {
  const result = readProjectConfiguration(tree, projectName).sourceRoot;

  if (result === undefined) {
    throw new Error(`No source folder for "${projectName}"`);
  }

  return result;
}

export function featurePath(tree: Tree, projectName: string, featureName: string): string {
  return joinPathFragments(projectSrcPath(tree, projectName), toKebabCase(featureName));
}

export function componentContainerPath(
  tree: Tree,
  projectName: string,
  featureName: string,
  type: ComponentType = 'component'
): string {
  return joinPathFragments(
    featurePath(tree, projectName, featureName),
    getComponentFolder(type)
  );
}

export function featureComponentPath(componentName: string, type: ComponentType = 'component'): string {
  return joinPathFragments(getComponentFolder(type), toKebabCase(componentName));
}

export function componentPath(
  tree: Tree,
  projectName: string,
  featureName: string,
  componentName: string,
  type: ComponentType = 'component'
): string {
  return joinPathFragments(
    featurePath(tree, projectName, featureName),
    featureComponentPath(componentName, type)
  );
}

export function featureRoutesPath(tree: Tree, projectName: string, featureName: string): string {
  return joinPathFragments(featurePath(tree, projectName, featureName), `${toKebabCase(featureName)}.routes.ts`);
}
