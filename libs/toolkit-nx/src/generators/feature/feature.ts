import { generateFiles, joinPathFragments, Tree } from '@nx/devkit';
import { featurePath, toKebabCase } from '../../lib/path-helper/path-helper';
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
}

export default featureGenerator;
