import { generateFiles, joinPathFragments, logger, Tree } from '@nx/devkit';
import { Expression, Node, SyntaxKind } from 'ts-morph';
import { insertArrayElement, morph, variableOfType } from '../../lib/code-morph/code-morph';
import {
  appRoutesPath,
  featurePath,
  featureRoutesPath,
  relativeImportPath,
  toKebabCase
} from '../../lib/path-helper/path-helper';
import {
  assertFeatureDoesNotExist
} from '../../lib/validators/assert-feature-does-not-exist/assert-feature-does-not-exist';
import { FeatureGeneratorSchema } from './feature-schema';

const routesTypes = [ 'Route[]', 'Routes' ];

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
    variableOfType(routesTypes, SyntaxKind.ArrayLiteralExpression),
    insertArrayElement(route, isWildcardRoute)
  );

  if (!result.state().withResult) {
    logger.warn(
      `No routes array of type ${routesTypes.join(' or ')} found in "${appRoutes}". `
        + `Add the routes of feature "${options.name}" manually.`
    );
    return;
  }

  result.save();
}

function isWildcardRoute(route: Expression): boolean {
  const path = Node.isObjectLiteralExpression(route)
    ? route.getProperty('path')
    : undefined;

  const value = Node.isPropertyAssignment(path)
    ? path.getInitializer()
    : undefined;

  return Node.isStringLiteral(value) && value.getLiteralValue() === '**';
}

export default featureGenerator;
