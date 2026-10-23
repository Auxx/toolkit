import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import { assertArtefactDoesNotExist } from './assert-artefact-does-not-exist';

describe('assertArtefactDoesNotExist', () => {
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

  it('should return true if artefact does not exist', () => {
    expect(assertArtefactDoesNotExist(tree, appName, featureName, 'user-list', 'component')).toBe(true);
  });

  it('should return true if an artefact with the same name exists with another type', () => {
    tree.write(`apps/${appName}/src/${featureName}/services/user-list/user-list.service.ts`, '');

    expect(assertArtefactDoesNotExist(tree, appName, featureName, 'user-list', 'component')).toBe(true);
  });

  it.each`
    type           | folder           | label
    ${'component'} | ${'components'}  | ${'Component'}
    ${'page'}      | ${'pages'}       | ${'Page'}
    ${'dialog'}    | ${'dialogs'}     | ${'Dialog'}
    ${'service'}   | ${'services'}    | ${'Service'}
    ${'pipe'}      | ${'pipes'}       | ${'Pipe'}
    ${'directive'} | ${'directives'}  | ${'Directive'}
  `('should throw an error if $type exists', ({ type, folder, label }) => {
    tree.write(`apps/${appName}/src/${featureName}/${folder}/user-list/user-list.${type}.ts`, '');

    expect(() => assertArtefactDoesNotExist(tree, appName, featureName, 'user-list', type))
      .toThrow(
        `${label} "user-list" already exists in feature "user" (apps/${appName}/src/${featureName}/${folder}/user-list).`
      );
  });

  it('should detect an existing artefact regardless of name case', () => {
    tree.write(`apps/${appName}/src/${featureName}/components/user-list/user-list.component.ts`, '');

    expect(() => assertArtefactDoesNotExist(tree, appName, featureName, 'userList', 'component'))
      .toThrow('Component "userList" already exists');
  });
});
