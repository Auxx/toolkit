import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import { Project, SyntaxKind } from 'ts-morph';
import { morph } from '../code-morph/code-morph';
import { isWildcardRoute, routesNotFoundMessage, routesVariable } from './routes';

describe('Routes', () => {
  let tree: Tree;

  const fileName = 'apps/front-end/src/app/app.routes.ts';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    addProjectConfiguration(tree, 'front-end', { root: 'apps/front-end', sourceRoot: 'apps/front-end/src' });
  });

  describe('routesVariable', () => {
    it.each`
    code                                           | name
    ${'export const appRoutes: Route[] = [];'}     | ${'appRoutes'}
    ${'export const routes: Routes = [];'}         | ${'routes'}
    `('should find routes array $name', ({ code, name }) => {
      tree.write(fileName, `const other: string[] = [];\n${code}`);

      const state = morph(tree, fileName, routesVariable()).state();

      expect(state.withResult ? state.result.getName() : undefined).toBe(name);
    });

    it('should signal when there is no routes array', () => {
      tree.write(fileName, 'export const routes = [];');

      expect(morph(tree, fileName, routesVariable()).state().withResult).toBe(false);
    });
  });

  describe('routesNotFoundMessage', () => {
    it('should name the file and the expected types', () => {
      expect(routesNotFoundMessage(fileName))
        .toBe(`No routes array of type Route[] or Routes found in "${fileName}".`);
    });
  });

  describe('isWildcardRoute', () => {
    const element = (code: string) =>
      new Project()
        .createSourceFile('example.ts', `const example = [${code}];`)
        .getFirstDescendantByKindOrThrow(SyntaxKind.ArrayLiteralExpression)
        .getElements()[0];

    it.each`
    code                                       | expected
    ${`{ path: '**', redirectTo: '' }`}        | ${true}
    ${`{ path: "**", component: NotFound }`}   | ${true}
    ${`{ path: '', component: Home }`}         | ${false}
    ${`{ path: 'orders', loadChildren }`}      | ${false}
    ${`{ redirectTo: '' }`}                    | ${false}
    ${'wildcardRoute'}                         | ${false}
    `('should return $expected for $code', ({ code, expected }) => {
      expect(isWildcardRoute(element(code))).toBe(expected);
    });
  });
});
