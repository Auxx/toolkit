import { names, readProjectConfiguration, Tree } from '@nx/devkit';

export type ComponentType = 'component' | 'page' | 'dialog' | 'service' | 'pipe' | 'directive';

export const defaultComponentPrefix = 'app';

const componentFolder: Record<ComponentType, string> = {
  component: 'components',
  page: 'pages',
  dialog: 'dialogs',
  service: 'services',
  pipe: 'pipes',
  directive: 'directives'
};

const componentSuffix: Record<ComponentType, string> = {
  component: 'component',
  page: 'page',
  dialog: 'dialog',
  service: 'service',
  pipe: 'pipe',
  directive: 'directive'
};

const componentClassSuffix: Record<ComponentType, string> = {
  component: 'Component',
  page: 'Page',
  dialog: 'Dialog',
  service: 'Service',
  pipe: 'Pipe',
  directive: 'Directive'
};

export function getComponentFolder(type: ComponentType) {
  return componentFolder[type];
}

export function getComponentSuffix(type: ComponentType) {
  return componentSuffix[type];
}

export function getComponentClassSuffix(type: ComponentType) {
  return componentClassSuffix[type];
}

export function createSelector(tree: Tree, projectName: string, name: string, camelCase?: boolean): string {
  const project = readProjectConfiguration(tree, projectName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prefix = (project as any).prefix ?? defaultComponentPrefix;
  const result = names(`${prefix}-${name}`);

  return camelCase === true
    ? result.propertyName
    : result.fileName;
}
