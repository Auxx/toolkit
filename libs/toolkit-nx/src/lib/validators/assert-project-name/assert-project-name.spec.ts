import { ExecutorContext } from '@nx/devkit';
import { assertProjectName } from './assert-project-name';

describe('assertProjectName', () => {
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

  it('should return project name if executor is attached to a project', () => {
    expect(assertProjectName({ ...context, projectName: 'toolkit-rx' }, 'sync-version')).toBe('toolkit-rx');
  });

  it('should throw an error if executor is not attached to a project', () => {
    expect(() => assertProjectName(context, 'sync-version'))
      .toThrow('sync-version should be attached to a project.');
  });
});
