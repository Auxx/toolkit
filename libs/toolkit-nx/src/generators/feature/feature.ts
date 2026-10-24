import { generateFiles, joinPathFragments, logger, Tree } from '@nx/devkit';
import { insertArrayElement, morph } from '../../lib/code-morph/code-morph';
import {
  appRoutesPath,
  featurePath,
  featureRoutesPath,
  relativeImportPath,
  toKebabCase
} from '../../lib/path-helper/path-helper';
import { isWildcardRoute, routesNotFoundMessage, routesVariable } from '../../lib/routes/routes';
import {
  assertFeatureDoesNotExist
} from '../../lib/validators/assert-feature-does-not-exist/assert-feature-does-not-exist';
import { FeatureGeneratorSchema } from './feature-schema';

export async function featureGenerator(tree: Tree, options: FeatureGeneratorSchema) {
  assertFeatureDoesNotExist(tree, options.project, options.name);

  const targetPath = featurePath(tree, options.project, options.name);
  const fileName = toKebabCase(options.name);

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    targetPath,
    { fileName }
  );

  wireFeatureRoutes(tree, options);
}

function wireFeatureRoutes(tree: Tree, options: FeatureGeneratorSchema) {
  const appRoutes = appRoutesPath(tree, options.project);

  if (!tree.exists(appRoutes)) {
    logger.warn(`"${appRoutes}" does not exist. Add the routes of feature "${options.name}" manually.`);
    return;
  }

  const featureRoutes = relativeImportPath(appRoutes, featureRoutesPath(tree, options.project, options.name));
  const route = `{ path: '${toKebabCase(options.name)}', `
    + `loadChildren: () => import('${featureRoutes}').then(m => m.routes) }`;

  const result = morph(
    tree,
    appRoutes,
    routesVariable(),
    insertArrayElement(route, isWildcardRoute)
  );

  if (!result.state().withResult) {
    logger.warn(`${routesNotFoundMessage(appRoutes)} Add the routes of feature "${options.name}" manually.`);
    return;
  }

  result.save();
}

export default featureGenerator;
