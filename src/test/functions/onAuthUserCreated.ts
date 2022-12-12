import { either, option, task, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';

import type { FunctionsBuilder } from '../..';
import type { Suite } from '../util';
import { defineTest } from '../util';

const functionsPath = __filename.replaceAll('masmott/dist/es6', 'masmott/dist/cjs');

export const test2Functions: FunctionsBuilder = (server) => ({
  functions: {
    saveLatestCreatedUser: {
      trigger: 'onAuthUserCreated',
      handler: ({ authUser }) =>
        server.db.upsertDoc({
          key: { collection: 'authUser', id: 'latestCreated' },
          data: { uid: authUser.uid },
        }),
    },
  },
});

const test2 = defineTest({
  name: `onAuthUserCreated trigger can upsert doc`,
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        authUser: {
          schema: { created: { type: 'StringField' } },
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
      taskEither.chainTaskK((signInResult) =>
        pipe(
          client.db.getDocWhen({
            key: { collection: 'authUser', id: 'latestCreated' },
            select: either.match(() => option.none, identity),
          }),
          task.map(
            (latestCreatedUserDoc) => latestCreatedUserDoc['uid'] === signInResult.authUser.uid
          )
        )
      )
    ),
  toResult: either.right(true),
});

export const test3Functions: FunctionsBuilder = (server) => ({
  functions: {
    saveLatestCreatedUser: {
      trigger: 'onAuthUserCreated',
      handler: ({ authUser }) =>
        server.db.upsertDoc({
          key: { collection: 'authUser', id: 'latestCreated' },
          data: { uid: authUser.uid },
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
        authUser: {
          schema: { created: { type: 'StringField' } },
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
          key: { collection: 'authUser', id: 'latestCreated' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ created: 'true' }),
});

const test4 = defineTest({
  name: `document should not be created if trigger not deployed`,
  type: 'fail',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        authUser: {
          schema: { created: { type: 'StringField' } },
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
          key: { collection: 'authUser', id: 'latestCreated' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ created: 'true' }),
});

export const suite: Suite = {
  name: 'onAuthUserCreated functions',
  tests: [test2, test3, test4],
};
