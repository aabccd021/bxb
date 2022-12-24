import { deepStrictEqual } from 'assert';
import { console, either, readonlyArray, readonlyRecord, task, taskEither } from 'fp-ts';
import type { Apply1 } from 'fp-ts/Apply';
import { flow, identity, pipe } from 'fp-ts/function';
import type { Task } from 'fp-ts/Task';
import type { TaskEither } from 'fp-ts/TaskEither';
import { withTimeout } from 'fp-ts-contrib/lib/Task/withTimeout';
import pLimit from 'p-limit';
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

export const ap: <A>(fa: Task<A>) => <B>(fab: Task<(a: A) => B>) => Task<B> = (fa) => (fab) => () =>
  Promise.all([Promise.resolve().then(fab), Promise.resolve().then(fa)]).then(([f, a]) => f(a));

export const par: Apply1<'Task'> = {
  URI: 'Task',
  map: (fa, f) => pipe(fa, task.map(f)),
  ap: (fab, fa) => pipe(fab, ap(fa)),
};

export const testsApplicative = taskEither.getApplicativeTaskValidation(
  par,
  readonlyArray.getSemigroup<unknown>()
);

export const withMaxConcurrency =
  (maxConcurrency: number) =>
  <A>(tasks: readonly Task<A>[]): Task<readonly A[]> =>
    pipe(maxConcurrency, pLimit, (limit) =>
      pipe(
        tasks,
        readonlyArray.traverse(task.ApplicativePar)((t) => () => limit(t))
      )
    );

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
      either.tryCatch(() => deepStrictEqual(result, test.toResult), identity)
    ),
    taskEither.mapLeft(readonlyArray.of),
    taskEither.chainFirstIOK(() => console.log(`Finished ${test.name}`)),
    withTimeout(either.left(['timed out'] as readonly unknown[]), test.timeout ?? 5000)
  );

const runTest = (test: Test) => (): TaskEither<readonly unknown[], unknown> =>
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

export const runTests = (p: { readonly maxConcurrency: number }) =>
  flow(
    readonlyArray.map((test: Test) => retrying(getRetryPolicy(test), runTest(test), either.isLeft)),
    withMaxConcurrency(p.maxConcurrency),
    task.map(
      readonlyArray.sequence(either.getApplicativeValidation(readonlyArray.getSemigroup<unknown>()))
    )
  );

export type RunTests = typeof runTests;

export const simpleTest = <T>(t: Omit<SingleTest<T>, 'type'>): SingleTest<T> => ({
  ...t,
  type: 'single',
});
