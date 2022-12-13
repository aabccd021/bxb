import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { TaskEither } from 'fp-ts/TaskEither';
import * as std from 'fp-ts-std';
import { describe, expect, test as test_ } from 'vitest';

import { applyCiEnv, applyClientEnv, applyServerEnv } from '../helper';
import type { StackType, StackWithEnv } from '../type';
import type { Suite } from './util';

export const runSuiteWithConfig =
  <T extends StackType>({
    stack,
    getTestEnv,
  }: {
    readonly stack: StackWithEnv<T>;
    readonly getTestEnv: TaskEither<{ readonly capability: 'test.getTestEnv' }, T['env']>;
  }) =>
  ({ suite }: { readonly suite: Suite }) => {
    (suite.concurrent ?? false ? describe.concurrent : describe)(
      suite.name,
      () =>
        suite.tests.forEach((test) => {
          (test.type === 'fail' ? test_.fails : test_)(
            test.name,
            () =>
              expect(
                pipe(
                  getTestEnv,
                  taskEither.map((env) => ({
                    client: applyClientEnv({ stack: stack.client, env: env.client }),
                    ci: applyCiEnv({ stack: stack.ci, env: env.ci }),
                    server: applyServerEnv({ stack: stack.server, env: env.server }),
                  })),
                  taskEither.chainW(test.expect),
                  std.task.execute
                )
              ).resolves.toEqual(test.toResult),
            { timeout: test.timeOut, retry: test.retry }
          );
        }),
      { timeout: suite.timeOut }
    );
  };

export * as functions from './functions';
export * as independence from './independence';
export * as capability from './stack';
export * from './util';
