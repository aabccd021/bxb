/* eslint-disable functional/no-expression-statement */
import { option, readonlyArray, readonlyRecord, string } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { join } from 'fp-ts-std/ReadonlyArray';
import * as fs from 'fs/promises';
import * as t from 'io-ts';

import { tests } from './test';

type W = { readonly key: readonly string[]; readonly value: string };

const UnknownRecord = t.record(t.string, t.unknown);

const flattenTests = (scope: readonly string[], obj: unknown): readonly W[] =>
  pipe(
    obj,
    UnknownRecord.decode,
    option.fromEither,
    option.map((recordObj) =>
      pipe(
        recordObj['name'],
        option.fromPredicate(string.isString),
        option.map((value) => [{ key: scope, value }]),
        option.getOrElse(() =>
          pipe(
            recordObj,
            readonlyRecord.mapWithIndex((idx, val) => flattenTests([...scope, idx], val)),
            readonlyRecord.reduce(string.Ord)([] as readonly W[], (a, b) => [...a, ...b]),
            (x) => x
          )
        )
      )
    ),
    option.getOrElse(() => [] as readonly W[])
  );

const flattenedTests = pipe(
  flattenTests([], tests),
  readonlyArray.map(({ key, value }) =>
    pipe(
      { left: pipe(key, readonlyArray.dropRight(1), join(' > ')), right: pipe(key, join('.')) },
      ({ left, right }) => `  "${left} > ${value}": masmottTests.${right},`
    )
  ),
  join('\n'),
  (x) => `/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
import type { Test} from '../src/test';
import { tests as masmottTests } from '../src/test';
export const tests: Record<string, Test> = {\n${x}\n};
`
);

const main = () => fs.writeFile('test/tests.ts', flattenedTests);

void main();
