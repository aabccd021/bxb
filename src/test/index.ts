import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import type { TaskEither } from 'fp-ts/TaskEither';
import * as std from 'fp-ts-std';
import { expect, test as test_ } from 'vitest';

import * as functions from './functions';
import * as stackTests from './stack';
import type { PartialStack, Test } from './util';

export const bxbTests = { functions, stackTests };

export const runTestsWithConfig =
  <S extends object = Record<string, never>>({
    stack,
  }: {
    readonly stack: TaskEither<unknown, PartialStack<S>>;
  }) =>
  // eslint-disable-next-line functional/no-return-void
  ({ tests }: { readonly tests: ReadonlyRecord<string, Test<S>> }) =>
    // eslint-disable-next-line functional/no-return-void
    Object.entries(tests).forEach(([name, test]) =>
      (test.type === 'fail' ? test_.fails : test_)(
        name,
        () =>
          expect(pipe(stack, taskEither.chainW(test.expect), std.task.execute)).resolves.toEqual(
            test.toResult
          ),
        { timeout: test.timeOut, retry: test.retry }
      )
    );
