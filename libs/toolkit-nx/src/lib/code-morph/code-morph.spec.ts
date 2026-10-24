import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import { Project, SourceFile, SyntaxKind, VariableDeclaration } from 'ts-morph';
import { insertArrayElement, modifyVariable, morph, variable, variableOfType } from './code-morph';

describe('Code Morph', () => {
  let tree: Tree;

  const appName = 'front-end';

  const fileName = `apps/${appName}/src/example.ts`;

  beforeEach(async () => {
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

  describe('morph', () => {
    it('should initialise state correctly', () => {
      tree.write(fileName, 'export const example = "example";');
      const state = morph(tree, fileName).state();

      expect(state.fullPath).toBe(fileName);
      expect(state.fileName).toBe('example.ts');
      expect(state.project).toBeInstanceOf(Project);
      expect(state.sourceFile).toBeInstanceOf(SourceFile);
    });
  });

  describe('variable', () => {
    it('should return an export variable declaration', () => {
      tree.write(fileName, 'export const example = "example";');

      const state = morph(tree, fileName, variable('example')).state();

      expect(state.withResult).toBe(true);
      expect(state.withResult ? state.result : undefined).toBeInstanceOf(VariableDeclaration);
    });

    it('should return an export variable declaration of specific kind', () => {
      tree.write(fileName, 'export const example = "example";');

      const state = morph(tree, fileName, variable('example', SyntaxKind.StringLiteral)).state();

      expect(state.withResult).toBe(true);
      expect(state.withResult ? state.result : undefined).toBeInstanceOf(VariableDeclaration);
    });

    it('should return an internal variable declaration', () => {
      tree.write(fileName, 'const example = "example";');

      const state = morph(tree, fileName, variable('example')).state();

      expect(state.withResult).toBe(true);
      expect(state.withResult ? state.result : undefined).toBeInstanceOf(VariableDeclaration);
    });

    it('should signal when variable is not found', () => {
      tree.write(fileName, 'const example = "example";');

      const state = morph(tree, fileName, variable('myExample')).state();

      expect(state.withResult).toBe(false);
    });
  });

  describe('modifyVariable', () => {
    it('should modify a string variable declaration', () => {
      tree.write(fileName, 'const example = "example";');

      const code = morph(
        tree,
        fileName,
        variable('example', SyntaxKind.StringLiteral),
        modifyVariable(decl => decl.setInitializer('"123"'))
      )
        .toString();

      expect(code).toBe('const example = "123";');
    });

    it('should modify an array variable declaration', () => {
      tree.write(fileName, 'const example = [1, 2, 3];');

      const code = morph(
        tree,
        fileName,
        variable('example', SyntaxKind.ArrayLiteralExpression),
        modifyVariable(decl => decl.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression).addElement('5'))
      )
        .toString();

      expect(code).toBe('const example = [1, 2, 3, 5];');
    });
  });

  describe('variableOfType', () => {
    it.each`
    code                                              | typeNames
    ${'export const appRoutes: Route[] = [];'}        | ${[ 'Route[]' ]}
    ${'export const appRoutes: Routes = [];'}         | ${[ 'Route[]', 'Routes' ]}
    ${'export const appRoutes: Array< Route > = [];'} | ${[ 'Array<Route>' ]}
    `('should find a variable declaration by type in $code', ({ code, typeNames }) => {
      tree.write(fileName, `const other = 1;\n${code}`);

      const state = morph(tree, fileName, variableOfType(typeNames, SyntaxKind.ArrayLiteralExpression)).state();

      expect(state.withResult).toBe(true);
      expect(state.withResult ? state.result.getName() : undefined).toBe('appRoutes');
    });

    it.each`
    code                                    | reason
    ${'export const appRoutes = [];'}       | ${'no type annotation'}
    ${'export const appRoutes: Route = {};'} | ${'other type'}
    ${'export const appRoutes: Route[] = getRoutes();'} | ${'other initializer kind'}
    `('should signal when variable is not found ($reason)', ({ code }) => {
      tree.write(fileName, code);

      const state = morph(tree, fileName, variableOfType([ 'Route[]' ], SyntaxKind.ArrayLiteralExpression)).state();

      expect(state.withResult).toBe(false);
    });
  });

  describe('insertArrayElement', () => {
    const noSpaces = (code: string) => code.replace(/\s+/g, '');

    it('should append an element', () => {
      tree.write(fileName, 'const example = [1, 2];');

      const code = morph(tree, fileName, variable('example'), insertArrayElement('3')).toString();

      expect(noSpaces(code)).toBe('constexample=[1,2,3];');
    });

    it('should insert an element before the first matching element', () => {
      tree.write(fileName, 'const example = [1, 2, 9, 9];');

      const code = morph(
        tree,
        fileName,
        variable('example'),
        insertArrayElement('3', el => el.getText() === '9')
      )
        .toString();

      expect(noSpaces(code)).toBe('constexample=[1,2,3,9,9];');
    });

    it('should append an element when nothing matches', () => {
      tree.write(fileName, 'const example = [1, 2];');

      const code = morph(
        tree,
        fileName,
        variable('example'),
        insertArrayElement('3', el => el.getText() === '9')
      )
        .toString();

      expect(noSpaces(code)).toBe('constexample=[1,2,3];');
    });

    it('should put inserted elements on new lines indented with two spaces', () => {
      tree.write(fileName, 'const example = [];');

      const code = morph(tree, fileName, variable('example'), insertArrayElement('1'), insertArrayElement('2'))
        .toString();

      expect(code).toBe('const example = [\n  1,\n  2\n];');
    });

    it('should insert into an empty array', () => {
      tree.write(fileName, 'const example = [];');

      const code = morph(tree, fileName, variable('example'), insertArrayElement('1')).toString();

      expect(noSpaces(code)).toBe('constexample=[1];');
    });

    it.each`
    code                             | name
    ${'const example = [1];'}        | ${'missing'}
    ${'const example = "example";'}  | ${'example'}
    `('should not change code when there is no array variable $name', ({ code, name }) => {
      tree.write(fileName, code);

      expect(morph(tree, fileName, variable(name), insertArrayElement('1')).toString()).toBe(code);
    });
  });
});
