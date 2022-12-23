import { pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import { match } from 'ts-pattern';
import { expect, test as test_ } from 'vitest';

type SimpleTest<T> = {
  readonly name: string;
  readonly expect: Task<T>;
  readonly type?: 'fail';
  readonly toResult: T;
  readonly timeout?: number;
  readonly retry?: number;
};

export const runSimpleTest = <T>({
  type,
  name,
  timeout,
  retry,
  expect: task,
  toResult: result,
}: SimpleTest<T>): IO<void> =>
  pipe(
    match(type)
      .with('fail', () => test_.fails)
      .with(undefined, () => test_)
      .exhaustive(),
    // eslint-disable-next-line functional/no-return-void
    (runner) => () =>
      runner(name, () => expect(task()).resolves.toEqual(result), { timeout, retry })
  );

export const simpleTest = <T>(t: SimpleTest<T>) => t;
