import { addProjectConfiguration, Tree, updateJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import componentGenerator from './component';

describe('Component Generator', () => {
  let tree: Tree;

  const appName = 'front-end';

  const featureName = 'user';

  const componentName = 'user-list';

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
  });

  it('should create an Angular component', async () => {
    tree.write(`apps/${appName}/src/${featureName}/routes.ts`, '');

    await componentGenerator(tree, {
      name: componentName,
      project: appName,
      feature: featureName,
      type: 'component'
    });

    const targetPath = `apps/${appName}/src/${featureName}/components/${componentName}`;

    expect(tree.children(targetPath).length).toBe(5);
    expect(tree.exists(`${targetPath}/${componentName}.component.scss`)).toBe(true);
    expect(tree.exists(`${targetPath}/${componentName}.component.html`)).toBe(true);
    expect(tree.exists(`${targetPath}/${componentName}.component.spec.ts`)).toBe(true);
    expect(tree.exists(`${targetPath}/${componentName}.component.stories.ts`)).toBe(true);
    expect(tree.exists(`${targetPath}/${componentName}.component.ts`)).toBe(true);
  });

  it('should generate a component with translations support', async () => {
    tree.write(`apps/${appName}/src/${featureName}/routes.ts`, '');
    updateJson(tree, 'package.json', json => ({ ...json, dependencies: { '@jsverse/transloco': '8.4.0' } }));

    await componentGenerator(tree, {
      name: componentName,
      project: appName,
      feature: featureName,
      type: 'component',
      translations: true
    });

    const targetPath = `apps/${appName}/src/${featureName}/components/${componentName}`;

    const html = tree.read(`${targetPath}/${componentName}.component.html`, 'utf-8')?.toString();
    expect(html).toContain('<ng-container *transloco="let t; prefix: \'frontEnd.UserListComponent\'">');
    expect(html).toContain('</ng-container>');

    const ts = tree.read(`${targetPath}/${componentName}.component.ts`, 'utf-8')?.toString();
    expect(ts).toContain('import { TranslocoDirective } from \'@jsverse/transloco\';');
    expect(ts).toContain('imports: [ TranslocoDirective ]');

    const spec = tree.read(`${targetPath}/${componentName}.component.spec.ts`, 'utf-8')?.toString();
    expect(spec).toContain('import { TranslocoTestingModule } from \'@jsverse/transloco\';');
    expect(spec).toContain('TranslocoTestingModule.forRoot(');
  });

  it('should generate a component without translations support', async () => {
    tree.write(`apps/${appName}/src/${featureName}/routes.ts`, '');

    await componentGenerator(tree, {
      name: componentName,
      project: appName,
      feature: featureName,
      type: 'component',
      translations: false
    });

    const targetPath = `apps/${appName}/src/${featureName}/components/${componentName}`;

    const html = tree.read(`${targetPath}/${componentName}.component.html`, 'utf-8')?.toString();
    expect(html).not.toContain('*transloco');

    const ts = tree.read(`${targetPath}/${componentName}.component.ts`, 'utf-8')?.toString();
    expect(ts).not.toContain('TranslocoDirective');

    const spec = tree.read(`${targetPath}/${componentName}.component.spec.ts`, 'utf-8')?.toString();
    expect(spec).not.toContain('TranslocoTestingModule');
    expect(spec).toContain('imports: [ UserListComponent ]');
  });

  it('should fail if translations are requested and Transloco is not installed', async () => {
    tree.write(`apps/${appName}/src/${featureName}/routes.ts`, '');

    await expect(() =>
      componentGenerator(tree, {
        name: componentName,
        project: appName,
        feature: featureName,
        type: 'component',
        translations: true
      })
    )
      .rejects
      .toThrow('Dependency "@jsverse/transloco" is not installed.');

    expect(tree.exists(`apps/${appName}/src/${featureName}/components/${componentName}`)).toBe(false);
  });

  it('should fail if feature does not exist', async () => {
    await expect(() =>
      componentGenerator(tree, {
        name: componentName,
        project: appName,
        feature: featureName,
        type: 'component'
      })
    )
      .rejects
      .toThrow();
  });
});
