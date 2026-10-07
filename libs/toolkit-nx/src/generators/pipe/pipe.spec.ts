import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import pipeGenerator from './pipe';

describe('Pipe Generator', () => {
  let tree: Tree;

  const appName = 'front-end';

  const featureName = 'user';

  const pipeName = 'user-name';

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

  it('should generate a pipe', async () => {
    tree.write(`apps/${appName}/src/${featureName}/routes.ts`, '');

    await pipeGenerator(tree, {
      name: pipeName,
      project: appName,
      feature: featureName
    });

    const targetPath = `apps/${appName}/src/${featureName}/pipes/${pipeName}`;

    expect(tree.children(targetPath).length).toBe(2);
    expect(tree.exists(`${targetPath}/${pipeName}.pipe.spec.ts`)).toBe(true);
    expect(tree.exists(`${targetPath}/${pipeName}.pipe.ts`)).toBe(true);
  });
});
