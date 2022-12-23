import { either, option, readonlyArray, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { runTests, simpleTest as test } from '../../src/simple-test';
import { filterStackWithTests } from '../../src/test';
import {
  defineSequentialTest,
  exportScopeTests,
  flattenTests,
  test as singleTest,
} from '../../src/test/util';

const tests = [
  test({
    name: 'exportScopeTests adds prefix to test name',
    expect: async () =>
      pipe(
        exportScopeTests({
          foo: {
            test001: singleTest({
              name: 'bar',
              stack: {},
              expect: () => taskEither.of('result'),
              toResult: either.right('result'),
            }),
          },
        }),
        readonlyArray.map((t) => t.name)
      ),
    toResult: ['foo > bar'],
  }),

  test({
    name: 'flattenTests flattens test',
    expect: async () =>
      pipe(
        flattenTests({
          fooModule: {
            tests: [
              singleTest({
                name: 'bar',
                stack: {},
                expect: () => taskEither.of('result'),
                toResult: either.right('result'),
              }),
            ],
          },
        }),
        readonlyArray.map((t) => t.name)
      ),
    toResult: ['fooModule > bar'],
  }),

  test({
    name: 'filterStackWithTests includes single tests with exact same stack',
    expect: async () =>
      pipe(
        {
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        },
        filterStackWithTests([
          singleTest({
            name: 'getDoc & upsertDoc',
            stack: { client: { db: { getDoc: true, upsertDoc: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
        ]),
        readonlyArray.map((t) => t.name)
      ),
    toResult: ['getDoc & upsertDoc'],
  }),

  test({
    name: 'filterStackWithTests includes single tests which stack is subset',
    expect: async () =>
      pipe(
        {
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        },
        filterStackWithTests([
          singleTest({
            name: 'getDoc',
            stack: { client: { db: { getDoc: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
        ]),
        readonlyArray.map((t) => t.name)
      ),
    toResult: ['getDoc'],
  }),

  test({
    name: 'filterStackWithTests does not includes single tests which stack is superset',
    expect: async () =>
      pipe(
        {
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        },
        filterStackWithTests([
          singleTest({
            name: 'getDoc & upsertDoc & getDocWhen',
            stack: { client: { db: { getDoc: true, upsertDoc: true, getDocWhen: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
        ]),
        readonlyArray.map((t) => t.name)
      ),
    toResult: [],
  }),

  test({
    name: 'filterStackWithTests includes sequential tests with exact same stack',
    expect: async () =>
      pipe(
        {
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        },
        filterStackWithTests([
          defineSequentialTest({
            stack: { client: { db: { getDoc: true, upsertDoc: true } } },
            name: 'getDoc & upsertDoc',
            tests: {
              first: {
                expect: () => taskEither.of('result'),
                toResult: either.right('result'),
              },
            },
          }),
        ]),
        readonlyArray.map((t) => t.name)
      ),
    toResult: ['getDoc & upsertDoc'],
  }),

  test({
    name: 'filterStackWithTests includes sequential tests which stack is subset',
    expect: async () =>
      pipe(
        {
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        },
        filterStackWithTests([
          defineSequentialTest({
            stack: { client: { db: { getDoc: true } } },
            name: 'getDoc',
            tests: {
              first: {
                expect: () => taskEither.of('result'),
                toResult: either.right('result'),
              },
            },
          }),
        ]),
        readonlyArray.map((t) => t.name)
      ),
    toResult: ['getDoc'],
  }),

  test({
    name: 'filterStackWithTests does not includes sequential tests which stack is superset',
    expect: async () =>
      pipe(
        {
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        },
        filterStackWithTests([
          defineSequentialTest({
            stack: { client: { db: { getDoc: true, upsertDoc: true, getDocWhen: true } } },
            name: 'getDoc & upsertDoc & getDocWhen',
            tests: {
              first: {
                expect: () => taskEither.of('result'),
                toResult: either.right('result'),
              },
            },
          }),
        ]),
        readonlyArray.map((t) => t.name)
      ),
    toResult: [],
  }),

  test({
    name: 'filterStackWithTests filters out tests which stack is not equal nor subset',
    expect: async () =>
      pipe(
        {
          client: {
            db: {
              getDoc: () => taskEither.of(option.none),
              upsertDoc: () => taskEither.right(undefined),
            },
          },
        },
        filterStackWithTests([
          singleTest({
            name: 'getDoc',
            stack: { client: { db: { getDoc: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
          singleTest({
            name: 'getDoc & upsertDoc',
            stack: { client: { db: { getDoc: true, upsertDoc: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
          singleTest({
            name: 'getDoc & upsertDoc & getDocWhen',
            stack: { client: { db: { getDoc: true, upsertDoc: true, getDocWhen: true } } },
            expect: () => taskEither.of('result'),
            toResult: either.right('result'),
          }),
          defineSequentialTest({
            stack: { client: { db: { getDoc: true } } },
            name: 'seq getDoc',
            tests: {
              first: {
                expect: () => taskEither.of('result'),
                toResult: either.right('result'),
              },
            },
          }),
          defineSequentialTest({
            stack: { client: { db: { getDoc: true, upsertDoc: true } } },
            name: 'seq getDoc & upsertDoc',
            tests: {
              first: {
                expect: () => taskEither.of('result'),
                toResult: either.right('result'),
              },
            },
          }),
          defineSequentialTest({
            stack: { client: { db: { getDoc: true, upsertDoc: true, getDocWhen: true } } },
            name: 'seq getDoc & upsertDoc & getDocWhen',
            tests: {
              first: {
                expect: () => taskEither.of('result'),
                toResult: either.right('result'),
              },
            },
          }),
        ]),
        readonlyArray.map((t) => t.name)
      ),
    toResult: ['getDoc', 'getDoc & upsertDoc', 'seq getDoc', 'seq getDoc & upsertDoc'],
  }),
];

const main = runTests(tests);

void main();
