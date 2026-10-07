import { generateFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import { featurePath } from '../../lib/path-helper/path-helper';
import {
  assertFeatureDoesNotExist
} from '../../lib/validators/assert-feature-does-not-exist/assert-feature-does-not-exist';
import { FeatureGeneratorSchema } from './feature-schema';

export async function featureGenerator(tree: Tree, options: FeatureGeneratorSchema) {
  assertFeatureDoesNotExist(tree, options.project, options.name);

  const targetPath = featurePath(tree, options.project, options.name);
  const { fileName } = names(options.name);

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    targetPath,
    { fileName }
  );
}

export default featureGenerator;
