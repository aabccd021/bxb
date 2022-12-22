import { readonlyArray, readonlyRecord, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import type { TaskEither } from 'fp-ts/TaskEither';
import * as t from 'io-ts';
import { match } from 'ts-pattern';
import { expect, test as test_ } from 'vitest';

import * as functions from './functions';
import * as stackTests from './stack';
import type { AnyStack, MakeCapabilitiesFilter, MakeStackFilter, MayCapability, PartialStack, StackFilter, StackFromFilter, Test } from './util';
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

type RunTest = <S extends StackFilter>(p: {
  readonly stack: TaskEither<unknown, StackFromFilter<S>>;
}) => (test: Test) => IO<void>;

export const runTest: RunTest =
  ({ stack }) =>
  (test) =>
    runSimpleTest({ ...test, expect: pipe(stack, taskEither.chainW(test.expect)) });

export const isUnknownReadonlyRecord = t.record(t.string, t.unknown).is;


const stackToFilter = <T extends AnyStack>(stack: T): MakeStackFilter<T> =>
  pipe(
    stack,
    readonlyRecord.map(capToFilter)
    // either.fromPredicate(isUnknownReadonlyRecord, identity),
    // either.matchW(
    //   () => true as MakeStackFilter<T>,
    //   (x) => stackToFilter(x) as MakeStackFilter<T>
    // )
  );

// const isSubRecord = ({
//   stack,
//   filter,
// }: {
//   readonly stack: ReadonlyRecord<string, unknown>;
//   readonly filter: ReadonlyRecord<string, unknown>;
// }): boolean =>
//   pipe(
//     filter,
//     readonlyRecord.mapWithIndex((subName, filterSub) =>
//       pipe(
//         stack,
//         readonlyRecord.lookup(subName),
//         option.map(
//           flow(
//             either.fromPredicate(isUnknownReadonlyRecord, identity),
//             either.match(
//               () => true,
//               (stackSub) => true
//             )
//           )
//         ),
//         option.getOrElse(() => false)
//       )
//     ),
//     readonlyRecord.foldMap(string.Ord)(boolean.MonoidAll)(identity)
//   );

export const getTestsByStack = ({ stack }: { readonly stack: PartialStack }) => {
  const a = stackToFilter(stack);
  pipe(
    { functions, stackTests },
    flattenTests,
    readonlyArray.filter((test) => isSubRecord({ stack, filter: test.stack }))
  );
};
