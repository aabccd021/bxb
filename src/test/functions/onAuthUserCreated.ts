import { either, option, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';

import type { FunctionsBuilder } from '../..';
import type { Suite } from '../util';
import { defineTest } from '../util';

const functionsPath = __filename.replaceAll('masmott/dist/es6', 'masmott/dist/cjs');

export const test2Functions: FunctionsBuilder = (server) => ({
  functions: {
    detectUserExists: {
      trigger: 'onAuthUserCreated',
      handler: () =>
        server.db.upsertDoc({
          key: { collection: 'detection', id: '1' },
          data: { status: 'true' },
        }),
    },
  },
});

const test2 = defineTest({
  name: `onAuthUserCreated trigger can upsert doc`,
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
          functions: { path: functionsPath, exportName: 'test2Functions' },
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
});

export const test3Functions: FunctionsBuilder = (server) => ({
  functions: {
    detectUserExists: {
      trigger: 'onAuthUserCreated',
      handler: () =>
        server.db.upsertDoc({
          key: { collection: 'detection', id: '1' },
          data: { status: 'true' },
        }),
    },
  },
});

const test3 = defineTest({
  name: `onAuthUserCreated trigger should not be called if not triggered`,
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
          functions: { path: functionsPath, exportName: 'test3Functions' },
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
});

const test4 = defineTest({
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
});

export const suite: Suite = {
  name: 'onAuthUserCreated functions',
  tests: [test2, test3, test4],
};
