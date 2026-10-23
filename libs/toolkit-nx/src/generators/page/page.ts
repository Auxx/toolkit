import { joinPathFragments, Tree } from '@nx/devkit';
import { SyntaxKind } from 'ts-morph';
import { addImportDeclaration, modifyVariable, morph, variable } from '../../lib/code-morph/code-morph';
import { featureComponentPath, featureRoutesPath, toKebabCase } from '../../lib/path-helper/path-helper';
import componentGenerator, { getLastRun } from '../component/component';
import { PageGeneratorSchema } from './page-schema';

export async function pageGenerator(tree: Tree, options: PageGeneratorSchema) {
  await componentGenerator(tree, { ...options, type: 'page', translations: true });

  const lastRun = getLastRun();

  if (lastRun.success) {
    const routesPath = featureRoutesPath(tree, options.project, options.feature);

    const state = morph(
      tree,
      routesPath,
      addImportDeclaration(
        [ lastRun.className ],
        './' + joinPathFragments(featureComponentPath(options.name, 'page'), lastRun.fileName)
      ),
      variable('routes', SyntaxKind.ArrayLiteralExpression),
      modifyVariable(decl =>
        decl
          .getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)
          .addElement(`{ path: '${toKebabCase(options.name)}', component: ${lastRun.className} }`)
      )
    );

    state.save();
  }
}

export default pageGenerator;
