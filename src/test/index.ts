import { boolean, readonlyArray, readonlyRecord, string, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import type { TaskEither } from 'fp-ts/TaskEither';
import { match } from 'ts-pattern';
import { expect, test as test_ } from 'vitest';

import * as functions from './functions';
import * as stackTests from './stack';
import type { AnyFilter, AnyStack, CapabilitySet, StackFilter, Test } from './util';
import { flattenTests } from './util';

const runSimpleTest = <T>({
  type,
  name,
  timeout,
  retry,
  expect: task,
  toResult: result,
}: {
  readonly name: string;
  readonly type?: 'fail';
  readonly expect: Task<T>;
  readonly toResult?: T;
  readonly timeout?: number;
  readonly retry?: number;
}) =>
  pipe(
    match(type)
      .with('fail', () => test_.fails)
      .with(undefined, () => test_)
      .exhaustive(),
    // eslint-disable-next-line functional/no-return-void
    (runner) => () =>
      runner(name, () => expect(task()).resolves.toEqual(result), { timeout, retry })
  );

// eslint-disable-next-line @typescript-eslint/ban-types
type RunTest = (getStack: TaskEither<unknown, AnyStack>) => (test: Test<{}>) => IO<void>;

export const runTest: RunTest = (getStack) => (test) =>
  runSimpleTest({
    ...test,
    expect: pipe(
      getStack,
      taskEither.chainW((k) => test.expect(k))
    ),
  });

const stackToFilter = (stack: CapabilitySet): StackFilter =>
  pipe(
    stack,
    readonlyRecord.map((stackOrCapability) =>
      typeof stackOrCapability === 'function' ? true : stackToFilter(stackOrCapability)
    )
  );

const isSubRecord = (a: AnyFilter, b: AnyFilter): boolean =>
  pipe(
    b,
    readonlyRecord.mapWithIndex((k, bb: AnyFilter | boolean) =>
      pipe(a[k], (aa) =>
        typeof aa === 'object' && typeof bb === 'object' ? isSubRecord(aa, bb) : aa === bb
      )
    ),
    readonlyRecord.foldMap(string.Ord)(boolean.MonoidAll)(identity)
  );

export const getTestsByStack = (stack: AnyStack) =>
  pipe(
    { functions, stackTests },
    flattenTests,
    readonlyArray.filter((test) => isSubRecord(stackToFilter(stack), test.stack))
  );
