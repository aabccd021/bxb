import { io, readonlyArray } from 'fp-ts';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import { expect, test as test_ } from 'vitest';

export type SimpleTest<T = unknown> = {
  readonly name: string;
  readonly expect: Task<T>;
  readonly shouldTimeout?: true;
  readonly toResult: T;
  readonly timeout?: number;
  readonly retry?: number;
};

export const runTests = readonlyArray.traverse(io.Applicative)(
  ({ shouldTimeout, name, timeout, retry, expect: task, toResult: result }: SimpleTest): IO<void> =>
    // eslint-disable-next-line functional/no-return-void
    () =>
      (shouldTimeout ? test_.fails : test_)(name, () => expect(task()).resolves.toEqual(result), {
        timeout,
        retry,
      })
);

export type RunTests = typeof runTests;

export const simpleTest = <T>(t: SimpleTest<T>) => t;
