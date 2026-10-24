import { Tree, updateJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import { assertDependencyInstalled } from './assert-dependency-installed';

describe('assertDependencyInstalled', () => {
  let tree: Tree;
  const dependency = '@jsverse/transloco';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it.each`
    section
    ${'dependencies'}
    ${'devDependencies'}
  `('should return true if dependency is listed in $section', ({ section }) => {
    updateJson(tree, 'package.json', json => ({ ...json, [section]: { [dependency]: '8.4.0' } }));

    expect(assertDependencyInstalled(tree, dependency, 'translations support')).toBe(true);
  });

  it('should throw an error if dependency is missing', () => {
    expect(() => assertDependencyInstalled(tree, dependency, 'translations support'))
      .toThrow(`Dependency "${dependency}" is not installed. It is required for translations support.`);
  });
});
