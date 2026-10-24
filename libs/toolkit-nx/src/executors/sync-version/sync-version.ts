import { joinPathFragments, PromiseExecutor } from '@nx/devkit';
import * as fs from 'node:fs';
import { assertProjectName } from '../../lib/validators/assert-project-name/assert-project-name';
import { SyncVersionExecutorSchema } from './sync-version-schema';

const packageJson = 'package.json';

const runExecutor: PromiseExecutor<SyncVersionExecutorSchema> = async (_options, context) => {
  const projectName = assertProjectName(context, 'sync-version');

  const version = JSON.parse(fs.readFileSync(packageJson, { encoding: 'utf8' })).version;
  const target = joinPathFragments(context.projectsConfigurations.projects[projectName].root, packageJson);
  const packageFile = JSON.parse(fs.readFileSync(target, { encoding: 'utf8' }));

  packageFile.version = version;

  if (Object.prototype.hasOwnProperty.call(packageFile, 'peerDependencies')) {
    Object.entries(packageFile.peerDependencies)
      .filter(([ key ]) => key.indexOf('@ec/') >= 0)
      .forEach(([ key ]) => packageFile.peerDependencies[key] = version);
  }

  if (Object.prototype.hasOwnProperty.call(packageFile, 'dependencies')) {
    Object.entries(packageFile.dependencies)
      .filter(([ key ]) => key.indexOf('@ec/') >= 0)
      .forEach(([ key ]) => packageFile.dependencies[key] = version);
  }

  fs.writeFileSync(target, JSON.stringify(packageFile, null, 2));

  return {
    success: true
  };
};

export default runExecutor;
