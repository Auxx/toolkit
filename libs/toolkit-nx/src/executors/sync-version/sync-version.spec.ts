import { ExecutorContext } from '@nx/devkit';

import executor from './sync-version';
import { SyncVersionExecutorSchema } from './sync-version-schema';

const options: SyncVersionExecutorSchema = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
  projectGraph: {
    nodes: {},
    dependencies: {}
  },
  projectsConfigurations: {
    projects: {},
    version: 2
  },
  nxJsonConfiguration: {}
};

// The executor modifies physical files in the system, we don't want to run that test for now.
// We should find a way to mock direct FS access.
xdescribe('SyncVersion Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
