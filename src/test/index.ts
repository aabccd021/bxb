import { boolean, readonlyArray, readonlyRecord, string, taskEither } from 'fp-ts';
import { flow, identity, pipe } from 'fp-ts/function';
import type { TaskEither } from 'fp-ts/TaskEither';

import * as functions from './functions';
import * as stackTests from './stack';
import type { AnyFilter, AnyStack, CapabilitySet, StackFilter, Test } from './util';
import { flattenTests } from './util';

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
