import { addProjectConfiguration, Tree, updateJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import featureGenerator from '../feature/feature';
import pageGenerator from './page';

describe('Page Generator', () => {
  let tree: Tree;

  const appName = 'front-end';

  const featureName = 'user';

  const componentName = 'user-list';

  beforeEach(async () => {
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

    await featureGenerator(tree, { name: featureName, project: appName });
  });

  it('should create an Angular page component', async () => {
    await pageGenerator(tree, {
      name: componentName,
      project: appName,
      feature: featureName
    });

    const targetPath = `apps/${appName}/src/${featureName}/pages/${componentName}`;

    expect(tree.children(targetPath).length).toBe(4);
    expect(tree.exists(`${targetPath}/${componentName}.page.scss`)).toBe(true);
    expect(tree.exists(`${targetPath}/${componentName}.page.html`)).toBe(true);
    expect(tree.exists(`${targetPath}/${componentName}.page.spec.ts`)).toBe(true);
    expect(tree.exists(`${targetPath}/${componentName}.page.stories.ts`)).toBe(false);
    expect(tree.exists(`${targetPath}/${componentName}.page.ts`)).toBe(true);
  });

  it('should generate a page with Storybook stories', async () => {
    updateJson(tree, 'package.json', json => ({
      ...json,
      devDependencies: { storybook: '10.5.0', '@storybook/angular': '10.5.0' }
    }));

    await pageGenerator(tree, {
      name: componentName,
      project: appName,
      feature: featureName,
      storybook: true
    });

    expect(tree.exists(`apps/${appName}/src/${featureName}/pages/${componentName}/${componentName}.page.stories.ts`))
      .toBe(true);
  });

  it('should fail and not register a route if Storybook stories are requested and Storybook is not installed', async () => {
    await expect(() =>
      pageGenerator(tree, {
        name: componentName,
        project: appName,
        feature: featureName,
        storybook: true
      })
    )
      .rejects
      .toThrow('Dependency "storybook" is not installed.');

    const routes = tree.read(`apps/${appName}/src/${featureName}/${featureName}.routes.ts`, 'utf-8');

    expect(tree.exists(`apps/${appName}/src/${featureName}/pages/${componentName}`)).toBe(false);
    expect(routes).not.toContain('UserListPage');
  });

  it('should register a route with kebab-case paths', async () => {
    await pageGenerator(tree, {
      name: 'orderList',
      project: appName,
      feature: featureName
    });

    const routes = tree.read(`apps/${appName}/src/${featureName}/${featureName}.routes.ts`, 'utf-8');

    expect(tree.exists(`apps/${appName}/src/${featureName}/pages/order-list/order-list.page.ts`)).toBe(true);
    expect(routes).toContain('./pages/order-list/order-list.page');
    expect(routes).toContain(`path: 'order-list'`);
    expect(routes).not.toContain('orderList');
  });

  it('should generate a page with translations support', async () => {
    updateJson(tree, 'package.json', json => ({ ...json, dependencies: { '@jsverse/transloco': '8.4.0' } }));

    await pageGenerator(tree, {
      name: componentName,
      project: appName,
      feature: featureName,
      translations: true
    });

    const ts = tree.read(`apps/${appName}/src/${featureName}/pages/${componentName}/${componentName}.page.ts`, 'utf-8');

    expect(ts).toContain('TranslocoDirective');
  });

  it('should fail and not register a route if translations are requested and Transloco is not installed', async () => {
    await expect(() =>
      pageGenerator(tree, {
        name: componentName,
        project: appName,
        feature: featureName,
        translations: true
      })
    )
      .rejects
      .toThrow('Dependency "@jsverse/transloco" is not installed.');

    const routes = tree.read(`apps/${appName}/src/${featureName}/${featureName}.routes.ts`, 'utf-8');

    expect(tree.exists(`apps/${appName}/src/${featureName}/pages/${componentName}`)).toBe(false);
    expect(routes).not.toContain('UserListPage');
  });
});
