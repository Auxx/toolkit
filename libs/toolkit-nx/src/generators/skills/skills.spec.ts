import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import skillsGenerator from "./skills";

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

  it('create skills', async () => {
    await skillsGenerator(tree, {
      name: componentName,
      project: appName,
      feature: featureName,
      type: 'component'
    });

    const targetPath = `.agents/skills`;

    expect(tree.children(targetPath).length).toBe(1);
    expect(tree.exists(`${targetPath}/toolkit-nx/SKILL.md`)).toBe(true);
    expect(tree.children(`${targetPath}/toolkit-nx/references`).length).toBe(6);
  });
});
