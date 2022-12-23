import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import { expect, test as test_ } from 'vitest';

type SimpleTest<T> = {
  readonly name: string;
  readonly expect: Task<T>;
  readonly shouldTimeout?: true;
  readonly toResult: T;
  readonly timeout?: number;
  readonly retry?: number;
};

export const runSimpleTest =
  <T>({
    shouldTimeout,
    name,
    timeout,
    retry,
    expect: task,
    toResult: result,
  }: SimpleTest<T>): IO<void> =>
  // eslint-disable-next-line functional/no-return-void
  () =>
    (shouldTimeout ? test_.fails : test_)(name, () => expect(task()).resolves.toEqual(result), {
      timeout,
      retry,
    });

export const simpleTest = <T>(t: SimpleTest<T>) => t;
