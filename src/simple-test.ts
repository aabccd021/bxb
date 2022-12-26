import { deepStrictEqual } from 'node:assert';
import * as fs from 'node:fs/promises';

import { console, either, readonlyArray, readonlyRecord, semigroup, task, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import type { Task } from 'fp-ts/Task';
import type { TaskEither } from 'fp-ts/TaskEither';
import { withTimeout } from 'fp-ts-contrib/lib/Task/withTimeout';
import printDiff from 'print-diff';
import * as retry from 'retry-ts';
import { retrying } from 'retry-ts/lib/Task';
import { match } from 'ts-pattern';

export type RetryPolicy =
  | {
      readonly type: 'count';
      readonly value: number;
    }
  | {
      readonly type: 'policy';
      readonly value: retry.RetryPolicy;
    };

export type SingleTest<T = unknown> = {
  readonly type: 'single';
  readonly name: string;
  readonly expect: Task<T>;
  readonly shouldTimeout?: true;
  readonly toResult: T;
  readonly timeout?: number;
  readonly retry?: RetryPolicy;
};

export type SequentialTest<T = unknown> = {
  readonly type: 'sequential';
  readonly name: string;
  readonly tests: Record<
    string,
    {
      readonly expect: Task<T>;
      readonly toResult: T;
      readonly shouldTimeout?: true;
      readonly timeout?: number;
    }
  >;
};

export type Test = SequentialTest | SingleTest;

const runAssertion = <T>(test: {
  readonly name: string;
  readonly expect: Task<T>;
  readonly toResult: T;
  readonly shouldTimeout?: true;
  readonly timeout?: number;
}) =>
  pipe(
    taskEither.fromIO(console.log(`Start ${test.name}`)),
    taskEither.chainTaskK(() => test.expect),
    taskEither.chainFirstIOK((result) => () => {
      printDiff(JSON.stringify(result, undefined, 2), JSON.stringify(test.toResult, undefined, 2));
      printDiff.unified(
        JSON.stringify(result, undefined, 2),
        JSON.stringify(test.toResult, undefined, 2)
      );
      printDiff.inline(
        JSON.stringify(result, undefined, 2),
        JSON.stringify(test.toResult, undefined, 2)
      );
    }),
    taskEither.chainEitherK((result) =>
      // eslint-disable-next-line functional/no-return-void
      either.tryCatch(() => deepStrictEqual(result, test.toResult), either.toError)
    ),
    taskEither.chainFirstIOK(() => console.log(`Finished ${test.name}`)),
    withTimeout(either.left('timed out' as unknown), test.timeout ?? 5000),
    taskEither.mapLeft((err) => ({ [test.name]: err }))
  );

const runTestWithoutRetry =
  (test: Test) => (): TaskEither<ReadonlyRecord<string, unknown>, unknown> =>
    match(test)
      .with({ type: 'single' }, runAssertion)
      .with({ type: 'sequential' }, (t) =>
        pipe(
          t.tests,
          readonlyRecord.mapWithIndex((subtestName, subTest) => ({
            ...subTest,
            name: `${t.name} > ${subtestName}`,
          })),
          readonlyRecord.traverse(taskEither.ApplicativeSeq)(runAssertion)
        )
      )
      .exhaustive();

const getRetryPolicy = (test: Test) =>
  match(test)
    .with({ type: 'single', retry: { type: 'policy' } }, (t) => t.retry.value)
    .with({ type: 'single', retry: { type: 'count' } }, (t) => retry.limitRetries(t.retry.value))
    .with({ type: 'single' }, () => retry.limitRetries(0))
    .with({ type: 'sequential' }, () => retry.limitRetries(0))
    .exhaustive();

export const runParallel = readonlyArray.sequence(task.ApplicativePar);

export const runSequential = readonlyArray.sequence(task.ApplicativeSeq);

// eslint-disable-next-line functional/no-return-void
export const setExitCode = (code: number) => () => {
  // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
  process.exitCode = code;
};

export const runTest = (test: Test) =>
  retrying(getRetryPolicy(test), runTestWithoutRetry(test), either.isLeft);

export const aggregateErrors = task.map(
  readonlyArray.sequence(
    either.getApplicativeValidation(readonlyRecord.getUnionSemigroup(semigroup.last<unknown>()))
  )
);

export const logAndThrowOnError = flow(
  taskEither.swap,
  taskEither.chainFirstIOK(console.log),
  taskEither.chainFirstTaskK(
    (res) => () => fs.writeFile('aab.json', JSON.stringify(res, undefined, 2))
  ),
  taskEither.chainFirstIOK(() => setExitCode(1))
);

export const getTestTasks = readonlyArray.map(runTest);

export const runTests = flow(getTestTasks, runParallel, aggregateErrors, logAndThrowOnError);

export const runTestsSeq = flow(getTestTasks, runSequential, aggregateErrors, logAndThrowOnError);

export const simpleTest = <T>(t: Omit<SingleTest<T>, 'type'>): SingleTest<T> => ({
  ...t,
  type: 'single',
});
