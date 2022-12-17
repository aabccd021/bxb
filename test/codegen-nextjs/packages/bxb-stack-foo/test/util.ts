import { taskEither } from 'fp-ts';
import type { Suite } from 'masmott/dist/cjs/test';
import { runSuiteWithConfig } from 'masmott/dist/cjs/test';

import { stack } from '../src';
import type { StackT } from '../src/env';

export const runSuite = runSuiteWithConfig<StackT>({
  stack,
  getTestEnv: taskEither.right({ ci: undefined, client: undefined, server: undefined }),
});

export const runSuiteConcurrent = (param: { readonly suite: Suite }) =>
  runSuite({ ...param, suite: { ...param.suite, concurrent: true } });
