import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import { assertFeatureDoesNotExist } from './assert-feature-does-not-exist';

describe('assertFeatureDoesNotExist', () => {
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

  it('should return true if feature does not exist', () => {
    tree.write(`apps/${appName}/src/${featureName}/routes.ts`, '');
    expect(() => assertFeatureDoesNotExist(tree, appName, featureName))
      .toThrow(`Feature "user" already exists.`);
  });

  it('should throw an error if feature exists', () => {
    expect(assertFeatureDoesNotExist(tree, appName, 'non-existent-feature')).toBe(true);
  });
});
