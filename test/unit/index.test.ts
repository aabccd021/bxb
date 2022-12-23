import { either, io, option, readonlyArray, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { runSimpleTest, simpleTest } from '../../src/simple-test';
import { filterStackWithTests } from '../../src/test';
import type { Test } from '../../src/test/util';
import { defineTest, exportScopeTests, flattenTests } from '../../src/test/util';

const tests = [
  simpleTest({
    name: 'exportScopeTests adds prefix to test name',
    expect: async () =>
      pipe(
        exportScopeTests({
          foo: {
            test001: defineTest({
              name: 'bar',
              stack: {},
              expect: () => taskEither.of('result'),
              toResult: either.right('result'),
            }),
          },
        }),
        readonlyArray.map((test) => test.name)
      ),
    toResult: ['foo > bar'],
  }),

  simpleTest({
    name: 'flattenTests flattens test',
    expect: async () =>
      pipe(
        flattenTests({
          fooModule: {
            tests: [
              defineTest({
                name: 'bar',
                stack: {},
                expect: () => taskEither.of('result'),
                toResult: either.right('result'),
              }),
            ],
          },
        }),
        readonlyArray.map((test) => test.name)
      ),
    toResult: ['fooModule > bar'],
  }),

  simpleTest({
    name: 'filterStackWithTests includes tests with exact same stack',
    expect: async () =>
      pipe(
        filterStackWithTests([
          defineTest({
            name: 'getDoc & upsertDoc',
            stack: { client: { db: { getDoc: true, upsertDoc: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
        ] as readonly Test[])({
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        }),
        readonlyArray.map((test) => test.name)
      ),
    toResult: ['getDoc & upsertDoc'],
  }),

  simpleTest({
    name: 'filterStackWithTests includes tests which stack is subset',
    expect: async () =>
      pipe(
        filterStackWithTests([
          defineTest({
            name: 'getDoc',
            stack: { client: { db: { getDoc: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
        ] as readonly Test[])({
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        }),
        readonlyArray.map((test) => test.name)
      ),
    toResult: ['getDoc'],
  }),

  simpleTest({
    name: 'filterStackWithTests does not includes tests which stack is superset',
    expect: async () =>
      pipe(
        filterStackWithTests([
          defineTest({
            name: 'getDoc & upsertDoc & getDocWhen',
            stack: { client: { db: { getDoc: true, upsertDoc: true, getDocWhen: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
        ] as readonly Test[])({
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        }),
        readonlyArray.map((test) => test.name)
      ),
    toResult: [],
  }),

  simpleTest({
    name: 'filterStackWithTests filters out tests which stack is not equal nor subset',
    expect: async () =>
      pipe(
        filterStackWithTests([
          defineTest({
            name: 'getDoc',
            stack: { client: { db: { getDoc: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
          defineTest({
            name: 'getDoc & upsertDoc',
            stack: { client: { db: { getDoc: true, upsertDoc: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
          defineTest({
            name: 'getDoc & upsertDoc & getDocWhen',
            stack: { client: { db: { getDoc: true, upsertDoc: true, getDocWhen: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
        ] as readonly Test[])({
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        }),
        readonlyArray.map((test) => test.name)
      ),
    toResult: ['getDoc', 'getDoc & upsertDoc'],
  }),
];

const main = readonlyArray.traverse(io.Applicative)(runSimpleTest)(tests);

void main();
