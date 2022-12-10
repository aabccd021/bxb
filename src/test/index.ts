import { apply, reader, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { TaskEither } from 'fp-ts/TaskEither';
import { describe, expect, test as test_ } from 'vitest';

import type { StackType, StackWithEnv } from '../type';
import type { Suite } from './util';

const readerS = apply.sequenceS(reader.Apply);

export const runSuiteWithConfig =
  <T extends StackType>({
    stack,
    getTestEnv,
  }: {
    readonly stack: StackWithEnv<T>;
    readonly getTestEnv: TaskEither<unknown, T['env']>;
  }) =>
  ({ suite }: { readonly suite: Suite }) => {
    (suite.concurrent ?? false ? describe.concurrent : describe)(suite.name, () =>
      suite.tests.forEach(({ name, expect: fn, toResult, type }) => {
        (type === 'fail' ? test_.fails : test_)(name, async () => {
          const result = pipe(
            getTestEnv,
            taskEither.map((env) => ({
              client: readerS({
                auth: readerS(stack.client.auth),
                db: readerS(stack.client.db),
                storage: readerS(stack.client.storage),
              })(env.client),
              ci: readerS(stack.ci)(env.ci),
              server: readerS({
                db: readerS(stack.server.db),
              })(env.server),
            })),
            taskEither.chainW(fn)
          );
          expect(await result()).toEqual(toResult);
        });
      })
    );
  };

export * as functions from './functions';
export * as independence from './independence';
export * as capability from './stack';
export * from './util';
