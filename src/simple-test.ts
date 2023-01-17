import { readonlyArray } from 'fp-ts';
import { flow } from 'fp-ts/function';
import type { Task } from 'fp-ts/Task';
import type * as retry from 'retry-ts';

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

export const getTestTasks = readonlyArray.map(runTest);

export const runTests = flow(getTestTasks, runParallel, aggregateErrors, logAndThrowOnError);

export const runTestsSeq = flow(getTestTasks, runSequential, aggregateErrors, logAndThrowOnError);

export const simpleTest = <T>(t: Omit<SingleTest<T>, 'type'>): SingleTest<T> => ({
  ...t,
  type: 'single',
});
