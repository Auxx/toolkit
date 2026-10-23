import { addProjectConfiguration, logger, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import { featureGenerator } from './feature';

describe('Feature Generator', () => {
  let tree: Tree;

  const appName = 'my-app';

  const featureName = 'new-feature';

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

  it('should generate a new feature inside project', async () => {
    const routes = `apps/${appName}/src/${featureName}/${featureName}.routes.ts`;

    await featureGenerator(tree, { name: featureName, project: appName });

    expect(tree.exists(routes)).toBe(true);
    expect(tree.isFile(routes)).toBe(true);
    expect(tree.read(routes)?.toString().replaceAll('\r', '').replaceAll('\n', ''))
      .toBe('import { Route } from \'@angular/router\';export const routes: Route[] = [];');
  });

  it('should not overwrite existing feature', async () => {
    const routes = `apps/${appName}/src/${featureName}/${featureName}.routes.ts`;
    tree.write(routes, '');

    await expect(() => featureGenerator(tree, { name: featureName, project: appName }))
      .rejects
      .toThrow(`Feature "new-feature" already exists.`);

    expect(tree.read(routes)?.toString()).toBe('');
  });

  describe('app routes', () => {
    const appRoutes = `apps/${appName}/src/app/app.routes.ts`;

    const singleLine = (code: string | undefined) => code?.replace(/\s+/g, ' ');

    const featureRoute = (name: string) =>
      `{ path: '${name}', loadChildren: () => import('../${name}/${name}.routes').then(m => m.routes) }`;

    it('should wire a new feature into app routes', async () => {
      tree.write(appRoutes, `import { Route } from '@angular/router';\n\nexport const appRoutes: Route[] = [];\n`);

      await featureGenerator(tree, { name: featureName, project: appName });

      expect(singleLine(tree.read(appRoutes, 'utf-8') ?? undefined))
        .toContain(`export const appRoutes: Route[] = [ ${featureRoute(featureName)} ];`);
    });

    it('should use kebab-case for route path and import', async () => {
      tree.write(appRoutes, `import { Routes } from '@angular/router';\n\nexport const routes: Routes = [];\n`);

      await featureGenerator(tree, { name: 'userProfile', project: appName });

      expect(singleLine(tree.read(appRoutes, 'utf-8') ?? undefined)).toContain(featureRoute('user-profile'));
    });

    it('should add routes of several features in order', async () => {
      tree.write(appRoutes, `import { Route } from '@angular/router';\n\nexport const appRoutes: Route[] = [];\n`);

      await featureGenerator(tree, { name: 'orders', project: appName });
      await featureGenerator(tree, { name: 'users', project: appName });

      expect(singleLine(tree.read(appRoutes, 'utf-8') ?? undefined))
        .toContain(`[ ${featureRoute('orders')}, ${featureRoute('users')} ]`);
    });

    it('should insert a feature route before the wildcard route', async () => {
      tree.write(
        appRoutes,
        `import { Route } from '@angular/router';\n\n`
          + `export const appRoutes: Route[] = [{ path: '', redirectTo: 'home', pathMatch: 'full' }, `
          + `{ path: '**', redirectTo: '' }];\n`
      );

      await featureGenerator(tree, { name: featureName, project: appName });

      expect(singleLine(tree.read(appRoutes, 'utf-8') ?? undefined)).toContain(
        `{ path: '', redirectTo: 'home', pathMatch: 'full' }, ${
          featureRoute(featureName)
        }, { path: '**', redirectTo: '' }`
      );
    });

    it('should create a feature and warn if app routes file does not exist', async () => {
      const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);

      await featureGenerator(tree, { name: featureName, project: appName });

      expect(tree.exists(`apps/${appName}/src/${featureName}/${featureName}.routes.ts`)).toBe(true);
      expect(tree.exists(appRoutes)).toBe(false);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('does not exist'));

      warn.mockRestore();
    });

    it('should not change app routes and warn if routes array is not found', async () => {
      const code = `export const appRoutes = getRoutes();\n`;
      tree.write(appRoutes, code);
      const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);

      await featureGenerator(tree, { name: featureName, project: appName });

      expect(tree.read(appRoutes, 'utf-8')).toBe(code);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('No routes array'));

      warn.mockRestore();
    });
  });
});
