import { generateFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import { createSelector, getComponentClassSuffix, getComponentSuffix } from '../../lib/component-types/component-types';
import { componentPath } from '../../lib/path-helper/path-helper';
import { assertFeatureExists } from '../../lib/validators/assert-feature-exists/assert-feature-exists';
import { ComponentGeneratorSchema } from './component-schema';

interface LastRun {
  success: boolean;
  className: string;
  fileName: string;
  selector: string;
}

const lastRun: LastRun = {
  success: true,
  className: '',
  fileName: '',
  selector: ''
};

export async function componentGenerator(tree: Tree, options: ComponentGeneratorSchema) {
  assertFeatureExists(tree, options.project, options.feature);

  const targetPath = componentPath(tree, options.project, options.feature, options.name, options.type);
  const artifact = names(options.name);

  const entityName = artifact.className;
  const className = `${artifact.className}${getComponentClassSuffix(options.type)}`;
  const fileName = `${artifact.fileName}.${getComponentSuffix(options.type)}`;
  const selector = createSelector(tree, options.project, options.name);

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    targetPath,
    {
      entityName,
      className,
      fileName,
      selector,
      translations: options.translations,
      projectName: names(options.project).propertyName
    }
  );

  lastRun.success = true;
  lastRun.className = className;
  lastRun.fileName = fileName;
  lastRun.selector = selector;
}

export function getLastRun(): LastRun {
  return lastRun;
}

export default componentGenerator;
