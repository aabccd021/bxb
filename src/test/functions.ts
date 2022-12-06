import { either, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
// eslint-disable-next-line fp-ts/no-module-imports
import { chainW as then } from 'fp-ts/TaskEither';

import type { FunctionsBuilder } from '..';
import type { Test } from '.';

const path = __filename.replaceAll('masmott/dist/es6', 'masmott/dist/cjs');

export const test1Functions: FunctionsBuilder = (server) => ({
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

export const test1: Test<unknown> = {
  name: `aabccd`,
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      then(() =>
        ci.deployFunctions({
          functions: { path, exportName: 'test1Functions' },
          server,
        })
      ),
      then(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      then(() => client.db.getDoc({ key: { collection: 'detection', id: '1' } }))
    ),
  toResult: either.right(option.some({ status: 'true' })),
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
  name: `can upsert doc when user created`,
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      then(() =>
        ci.deployFunctions({
          functions: { path, exportName: 'test2Functions' },
          server,
        })
      ),
      then(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      then(() => client.db.getDoc({ key: { collection: 'detection', id: '1' } }))
    ),
  toResult: either.right(option.some({ status: 'true' })),
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
  name: `function not triggered if not signed in`,
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      then(() =>
        ci.deployFunctions({
          functions: { path, exportName: 'test3Functions' },
          server,
        })
      ),
      then(() => client.db.getDoc({ key: { collection: 'detection', id: '1' } }))
    ),
  toResult: either.right(option.none),
};
