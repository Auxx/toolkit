import { Expression, Node, SyntaxKind } from 'ts-morph';
import { variableOfType } from '../code-morph/code-morph';

export const routesTypes = [ 'Route[]', 'Routes' ];

export function routesVariable<T>() {
  return variableOfType<T>(routesTypes, SyntaxKind.ArrayLiteralExpression);
}

export function routesNotFoundMessage(routesPath: string): string {
  return `No routes array of type ${routesTypes.join(' or ')} found in "${routesPath}".`;
}

export function isWildcardRoute(route: Expression): boolean {
  const path = Node.isObjectLiteralExpression(route)
    ? route.getProperty('path')
    : undefined;

  const value = Node.isPropertyAssignment(path)
    ? path.getInitializer()
    : undefined;

  return Node.isStringLiteral(value) && value.getLiteralValue() === '**';
}
