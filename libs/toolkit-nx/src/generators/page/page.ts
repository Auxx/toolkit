import { joinPathFragments, Tree } from '@nx/devkit';
import { addImportDeclaration, insertArrayElement, morph } from '../../lib/code-morph/code-morph';
import { featureComponentPath, featureRoutesPath, toKebabCase } from '../../lib/path-helper/path-helper';
import { isWildcardRoute, routesNotFoundMessage, routesVariable } from '../../lib/routes/routes';
import componentGenerator, { getLastRun } from '../component/component';
import { PageGeneratorSchema } from './page-schema';

export async function pageGenerator(tree: Tree, options: PageGeneratorSchema) {
  await componentGenerator(tree, { ...options, type: 'page' });

  const lastRun = getLastRun();

  if (lastRun.success) {
    const routesPath = featureRoutesPath(tree, options.project, options.feature);

    const result = morph(
      tree,
      routesPath,
      routesVariable(),
      insertArrayElement(`{ path: '${toKebabCase(options.name)}', component: ${lastRun.className} }`, isWildcardRoute),
      addImportDeclaration(
        [ lastRun.className ],
        './' + joinPathFragments(featureComponentPath(options.name, 'page'), lastRun.fileName)
      )
    );

    if (!result.state().withResult) {
      throw new Error(`${routesNotFoundMessage(routesPath)} Page "${options.name}" was not created.`);
    }

    result.save();
  }
}

export default pageGenerator;
