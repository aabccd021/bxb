/* eslint-disable functional/no-conditional-statement */
import { either, option, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';

// eslint-disable-next-line fp-ts/no-module-imports
import type { FunctionsBuilder } from '..';
import type { Test } from './util';

const path = __filename.replaceAll('masmott/dist/es6', 'masmott/dist/cjs');

export const independencyFunctions: FunctionsBuilder = (server) => ({
  functions: {
    createDocOnAuthCreated: {
      trigger: 'onAuthCreated',
      handler: () =>
        server.db.upsertDoc({
          key: { collection: 'detection', id: '1' },
          data: { status: 'true' },
        }),
    },
  },
});

export const independencyTest1: Test<unknown> = {
  name: `a test can deploy trigger`,
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      taskEither.chainW(() =>
        ci.deployFunctions({
          functions: { path, exportName: 'independencyFunctions' },
          server,
        })
      ),
      taskEither.chainW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainTaskK(() =>
        client.db.getDocWhen({
          key: { collection: 'detection', id: '1' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ status: 'true' }),
};

export const independencyTest2: Test<unknown> = {
  name: `another test shouldn't be affected by trigger from another test`,
  type: 'fail',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      taskEither.chainW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainTaskK(() =>
        client.db.getDocWhen({
          key: { collection: 'detection', id: '1' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ status: 'true' }),
};

export const test2Functions: FunctionsBuilder = (server) => ({
  functions: {
    detectUserExists: {
      trigger: 'onAuthCreated',
      handler: () =>
        server.db.upsertDoc({
          key: { collection: 'detection', id: '1' },
          data: { status: 'true' },
        }),
    },
  },
});

export const test2: Test<unknown> = {
  name: `onAuthCreated trigger can upsert doc`,
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      taskEither.chainW(() =>
        ci.deployFunctions({
          functions: { path, exportName: 'test2Functions' },
          server,
        })
      ),
      taskEither.chainW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainTaskK(() =>
        client.db.getDocWhen({
          key: { collection: 'detection', id: '1' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ status: 'true' }),
};

export const test3Functions: FunctionsBuilder = (server) => ({
  functions: {
    detectUserExists: {
      trigger: 'onAuthCreated',
      handler: () =>
        server.db.upsertDoc({
          key: { collection: 'detection', id: '1' },
          data: { status: 'true' },
        }),
    },
  },
});

export const test3: Test<unknown> = {
  name: `onAuthCreated trigger should not be called if not triggered`,
  type: 'fail',
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      taskEither.chainW(() =>
        ci.deployFunctions({
          functions: { path, exportName: 'test3Functions' },
          server,
        })
      ),
      taskEither.chainTaskK(() =>
        client.db.getDocWhen({
          key: { collection: 'detection', id: '1' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ status: 'true' }),
};

export const test4: Test<unknown> = {
  name: `document should not be created if trigger not deployed`,
  type: 'fail',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      taskEither.chainW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainTaskK(() =>
        client.db.getDocWhen({
          key: { collection: 'detection', id: '1' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ status: 'true' }),
};
