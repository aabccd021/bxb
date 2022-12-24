import { boolean, readonlyArray, readonlyRecord, string, taskEither } from 'fp-ts';
import { flow, identity, pipe } from 'fp-ts/function';
import type { TaskEither } from 'fp-ts/TaskEither';
import { match } from 'ts-pattern';

import type * as simple from '../simple-test';
import * as functions from './functions';
import * as stackTests from './stack';
import type { AnyFilter, AnyStack, CapabilitySet, StackFilter, Test } from './util';
import { flattenTests } from './util';

export const runTestsWithRunner =
  (getStack: TaskEither<unknown, AnyStack>) =>
  (tests: readonly Test[]): readonly simple.Test[] =>
    pipe(
      tests,
      readonlyArray.map(
        (test): simple.Test =>
          match(test)
            .with({ type: 'single' }, (singleTest) => ({
              ...singleTest,
              expect: pipe(getStack, taskEither.chainW(singleTest.expect)),
            }))
            .with({ type: 'sequential' }, (sequentialTests) => ({
              ...sequentialTests,
              tests: pipe(
                sequentialTests.tests,
                readonlyRecord.map((sequentialTest) => ({
                  ...sequentialTest,
                  expect: pipe(getStack, taskEither.chainW(sequentialTest.expect)),
                }))
              ),
            }))
            .exhaustive()
      )
    );

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

export const filterStackWithTests =
  (tests: readonly Test[]) => (getStack: TaskEither<unknown, AnyStack>) =>
    pipe(
      getStack,
      taskEither.map(
        flow(stackToFilter, (filter) =>
          pipe(
            tests,
            readonlyArray.filter((test) => isSubRecord(filter, test.stack))
          )
        )
      )
    );

const allTests = flattenTests({ functions, stackTests });

export const getTestsOfStack = filterStackWithTests(allTests);
