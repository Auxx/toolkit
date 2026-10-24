import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import { assertFeatureExists } from './assert-feature-exists';

describe('assertFeatureExists', () => {
  let tree: Tree;
  const appName = 'front-end';
  const featureName = 'user';

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

  it('should return true if feature exists', () => {
    tree.write(`apps/${appName}/src/${featureName}/routes.ts`, '');
    expect(assertFeatureExists(tree, appName, featureName)).toBe(true);
  });

  it('should throw an error if feature does not exist', () => {
    expect(() => assertFeatureExists(tree, appName, 'non-existent-feature'))
      .toThrow(`Feature "non-existent-feature" does not exist.`);
  });
});
