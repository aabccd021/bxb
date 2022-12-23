import { boolean, readonlyArray, readonlyRecord, readonlyTuple, string, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';
import type { TaskEither } from 'fp-ts/TaskEither';
import { match } from 'ts-pattern';

import type { RunTests } from '../simple-test';
import { runTests as realRunTests } from '../simple-test';
import * as functions from './functions';
import * as stackTests from './stack';
import type { AnyFilter, AnyStack, CapabilitySet, StackFilter, Test } from './util';
import { flattenTests } from './util';

export const runTestsWithRunner =
  (runTests: RunTests) => (getStack: TaskEither<unknown, AnyStack>) => (tests: readonly Test[]) =>
    pipe(
      tests,
      readonlyArray.chain((test) =>
        match(test)
          .with({ type: 'single' }, (singleTest) => [
            {
              ...singleTest,
              expect: pipe(getStack, taskEither.chainW(singleTest.expect)),
            },
          ])
          .with({ type: 'sequential' }, (sequentialTests) =>
            pipe(
              sequentialTests.tests,
              readonlyRecord.mapWithIndex((testName, sequentialTest) => ({
                ...sequentialTest,
                name: `${sequentialTests.name} > ${testName}`,
                expect: pipe(getStack, taskEither.chainW(sequentialTest.expect)),
              })),
              readonlyRecord.toReadonlyArray,
              readonlyArray.map(readonlyTuple.snd)
            )
          )
          .exhaustive()
      ),
      runTests
    );

export const runTests = runTestsWithRunner(realRunTests);

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

export const filterStackWithTests = (tests: readonly Test[]) => (stack: AnyStack) =>
  pipe(stack, stackToFilter, (filter) =>
    pipe(
      tests,
      readonlyArray.filter((test) => isSubRecord(filter, test.stack))
    )
  );

const allTests = flattenTests({ functions, stackTests });

export const getTestsOfStack = filterStackWithTests(allTests);
