/* eslint-disable functional/no-expression-statement */
import { option, readonlyArray, readonlyRecord, string } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { join } from 'fp-ts-std/ReadonlyArray';
import * as fs from 'fs/promises';
import * as t from 'io-ts';

import { bxbTests } from './test';

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
  flattenTests([], bxbTests),
  readonlyArray.map(({ key, value }) =>
    pipe(
      { left: pipe(key, readonlyArray.dropRight(1), join(' > ')), right: pipe(key, join('.')) },
      ({ left, right }) => `  "${left} > ${value}": bxbTests.${right},`
    )
  ),
  join('\n'),
  (x) => `
import type { Test } from 'bxb';
import { tests as bxbTests } from 'bxb';
import type { Stack } from '../src'
export const tests: ReadonlyRecord<string, Test<Stack>> = {\n${x}\n};
  readon
`
);

const main = () => fs.writeFile('test/tests.generated.ts', flattenedTests);

void main();
