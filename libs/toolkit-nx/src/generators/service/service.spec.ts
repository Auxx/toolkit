import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import serviceGenerator from './service';

describe('Service Generator', () => {
  let tree: Tree;

  const appName = 'front-end';

  const featureName = 'user';

  const serviceName = 'user-api';

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

  it('should generate a service', async () => {
    tree.write(`apps/${appName}/src/${featureName}/routes.ts`, '');

    await serviceGenerator(tree, {
      name: serviceName,
      project: appName,
      feature: featureName
    });

    const targetPath = `apps/${appName}/src/${featureName}/services/${serviceName}`;

    expect(tree.children(targetPath).length).toBe(2);
    expect(tree.exists(`${targetPath}/${serviceName}.service.spec.ts`)).toBe(true);
    expect(tree.exists(`${targetPath}/${serviceName}.service.ts`)).toBe(true);
  });

  it('should not overwrite an existing service', async () => {
    tree.write(`apps/${appName}/src/${featureName}/routes.ts`, '');
    const existing = `apps/${appName}/src/${featureName}/services/${serviceName}/${serviceName}.service.ts`;
    tree.write(existing, '// edited by user');

    await expect(() => serviceGenerator(tree, { name: serviceName, project: appName, feature: featureName }))
      .rejects
      .toThrow(`Service "${serviceName}" already exists in feature "${featureName}"`);

    expect(tree.read(existing, 'utf-8')).toBe('// edited by user');
  });
});
