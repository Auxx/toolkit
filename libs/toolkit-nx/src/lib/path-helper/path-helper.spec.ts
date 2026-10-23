import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import {
  appRoutesPath,
  componentContainerPath,
  componentPath,
  featureComponentPath,
  featurePath,
  featureRoutesPath,
  projectPath,
  projectSrcPath,
  relativeImportPath,
  toKebabCase
} from './path-helper';

describe('Path Helper', () => {
  let tree: Tree;

  const appName = 'my-app';
  const libName = 'my-lib';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    addProjectConfiguration(
      tree,
      appName,
      {
        projectType: 'application',
        root: `apps/${appName}`,
        sourceRoot: `apps/${appName}/src`
      }
    );

    addProjectConfiguration(
      tree,
      libName,
      {
        projectType: 'application',
        root: `libs/${libName}`,
        sourceRoot: `libs/${libName}/src`
      }
    );
  });

  describe('toKebabCase', () => {
    it.each`
    name               | expected
    ${'user-info'}     | ${'user-info'}
    ${'userInfo'}      | ${'user-info'}
    ${'UserInfo'}      | ${'user-info'}
    ${'user_info'}     | ${'user-info'}
    ${'user info'}     | ${'user-info'}
    `('should convert $name to kebab-case', ({ name, expected }) => {
      expect(toKebabCase(name)).toBe(expected);
    });
  });

  describe('projectPath', () => {
    it.each`
    projectName | expectedPath
    ${appName}  | ${`apps/${appName}`}
    ${libName}  | ${`libs/${libName}`}
    `('should return path to project $projectName', ({ projectName, expectedPath }) => {
      expect(projectPath(tree, projectName)).toBe(expectedPath);
    });
  });

  describe('projectSrcPath', () => {
    it.each`
    projectName | expectedPath
    ${appName}  | ${`apps/${appName}/src`}
    ${libName}  | ${`libs/${libName}/src`}
    `('should return path to project source $projectName', ({ projectName, expectedPath }) => {
      expect(projectSrcPath(tree, projectName)).toBe(expectedPath);
    });
  });

  describe('featurePath', () => {
    it.each`
    projectName | featureName  | expectedPath
    ${appName}  | ${'app'}     | ${`apps/${appName}/src/app`}
    ${appName}  | ${'welcome'} | ${`apps/${appName}/src/welcome`}
    ${appName}  | ${'auth'}    | ${`apps/${appName}/src/auth`}
    ${libName}  | ${'layouts'} | ${`libs/${libName}/src/layouts`}
    ${libName}  | ${'dialogs'} | ${`libs/${libName}/src/dialogs`}
    `(
      'should return path to feature $featureName inside project $projectName',
      ({ projectName, featureName, expectedPath }) => {
        expect(featurePath(tree, projectName, featureName)).toBe(expectedPath);
      }
    );

    it('should normalise feature name', () => {
      expect(featurePath(tree, appName, 'userProfile')).toBe(`apps/${appName}/src/user-profile`);
    });
  });

  describe('featureComponentPath', () => {
    it.each`
    componentName     | type           | expectedPath
    ${'user-info'}    | ${'component'} | ${'components/user-info'}
    ${'orderList'}    | ${'page'}      | ${'pages/order-list'}
    ${'ConfirmExit'}  | ${'dialog'}    | ${'dialogs/confirm-exit'}
    `(
      'should return path to component $componentName of type $type relative to feature',
      ({ componentName, type, expectedPath }) => {
        expect(featureComponentPath(componentName, type)).toBe(expectedPath);
      }
    );
  });

  describe('componentContainerPath', () => {
    it.each`
    projectName | featureName  | type           | expectedPath
    ${appName}  | ${'welcome'} | ${'component'} | ${`apps/${appName}/src/welcome/components`}
    ${appName}  | ${'auth'}    | ${'page'}      | ${`apps/${appName}/src/auth/pages`}
    `('should return path to a component container $type', ({ projectName, featureName, type, expectedPath }) => {
      expect(componentContainerPath(tree, projectName, featureName, type)).toBe(expectedPath);
    });
  });

  describe('componentPath', () => {
    it.each`
    projectName | featureName  | componentName  | type | expectedPath
    ${appName}  | ${'welcome'} | ${'user-info'} | ${'component'} | ${`apps/${appName}/src/welcome/components/user-info`}
    ${appName}  | ${'auth'}    | ${'reset'}     | ${'component'} | ${`apps/${appName}/src/auth/components/reset`}
    ${appName}  | ${'auth'}    | ${'back'}      | ${'page'} | ${`apps/${appName}/src/auth/pages/back`}
    `(
      'should return path to component $componentName of type $type',
      ({ projectName, featureName, componentName, type, expectedPath }) => {
        expect(componentPath(tree, projectName, featureName, componentName, type)).toBe(expectedPath);
      }
    );

    it('should normalise path names', () => {
      expect(componentPath(tree, appName, 'featureName', 'componentName', 'component'))
        .toBe('apps/my-app/src/feature-name/components/component-name');
    });
  });

  describe('featureRoutesPath', () => {
    it('should return path to a feature routes file', () => {
      expect(featureRoutesPath(tree, appName, 'welcome')).toBe(`apps/${appName}/src/welcome/welcome.routes.ts`);
    });

    it('should normalise feature name', () => {
      expect(featureRoutesPath(tree, appName, 'userProfile'))
        .toBe(`apps/${appName}/src/user-profile/user-profile.routes.ts`);
    });
  });

  describe('appRoutesPath', () => {
    it('should return path to the app routes file', () => {
      expect(appRoutesPath(tree, appName)).toBe(`apps/${appName}/src/app/app.routes.ts`);
    });
  });

  describe('relativeImportPath', () => {
    it.each`
    fromFile                     | toFile                                  | expected
    ${'src/app/app.routes.ts'}   | ${'src/orders/orders.routes.ts'}        | ${'../orders/orders.routes'}
    ${'src/orders/orders.routes.ts'} | ${'src/orders/pages/list/list.page.ts'} | ${'./pages/list/list.page'}
    ${'src/app/app.routes.ts'}   | ${'src/app/app.config.ts'}              | ${'./app.config'}
    `('should return import path from $fromFile to $toFile', ({ fromFile, toFile, expected }) => {
      expect(relativeImportPath(fromFile, toFile)).toBe(expected);
    });
  });
});
