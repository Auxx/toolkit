import { ExecutorContext } from '@nx/devkit';

export function assertProjectName(context: ExecutorContext, executor: string): string {
  if (context.projectName === undefined) {
    throw new Error(`${executor} should be attached to a project.`);
  }

  return context.projectName;
}
