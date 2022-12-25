import { deepStrictEqual } from 'assert';
import { console, either, readonlyArray, readonlyRecord, task, taskEither } from 'fp-ts';
import { apply, flow, pipe } from 'fp-ts/function';
import type { Task } from 'fp-ts/Task';
import type { TaskEither } from 'fp-ts/TaskEither';
import { withTimeout } from 'fp-ts-contrib/lib/Task/withTimeout';
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
    taskEither.chainEitherK((result) =>
      // eslint-disable-next-line functional/no-return-void
      either.tryCatch(() => deepStrictEqual(result, test.toResult), either.toError)
    ),
    taskEither.mapLeft(readonlyArray.of),
    taskEither.chainFirstIOK(() => console.log(`Finished ${test.name}`)),
    withTimeout(either.left(['timed out'] as readonly unknown[]), test.timeout ?? 5000)
  );

const runTestWithoutRetry = (test: Test) => (): TaskEither<readonly unknown[], unknown> =>
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
    .with({ type: 'single', retry: undefined }, () => retry.limitRetries(0))
    .with({ type: 'sequential' }, () => retry.limitRetries(0))
    .exhaustive();

export const runParallelWithConcurrency =
  (concurrency: number) =>
  <A>(tasks: readonly Task<A>[]): Task<readonly A[]> =>
    pipe(
      () => import('p-limit'),
      task.map(
        flow(
          (pLimit) => pLimit.default(concurrency),
          (limiter) => readonlyArray.traverse(task.ApplicativePar)((t: Task<A>) => () => limiter(t))
        )
      ),
      task.chain(apply(tasks))
    );

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
  readonlyArray.sequence(either.getApplicativeValidation(readonlyArray.getSemigroup<unknown>()))
);

export const logAndThrowOnError = flow(
  taskEither.swap,
  taskEither.chainIOK(console.error),
  taskEither.chainIOK(() => setExitCode(1))
);

export const getTestTasks = readonlyArray.map(runTest);

export const runTests = flow(getTestTasks, runParallel, aggregateErrors, logAndThrowOnError);

export const runTestsWithMaxConcurrency = (concurrency: number) =>
  flow(getTestTasks, runParallelWithConcurrency(concurrency), aggregateErrors, logAndThrowOnError);

export const simpleTest = <T>(t: Omit<SingleTest<T>, 'type'>): SingleTest<T> => ({
  ...t,
  type: 'single',
});
