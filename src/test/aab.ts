import { either, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
// eslint-disable-next-line fp-ts/no-module-imports
import { chainW as then } from 'fp-ts/TaskEither';

import type { DeployFunctionParam, Stack } from '../type';
import type { Test } from '.';

type Type = (server: Stack.server.Type) => DeployFunctionParam;

export const test1Functions: Type = (server) => ({
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
          functions: { path: __filename, exportName: 'test1Functions' },
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

export const test2Functions: Type = (server) => ({
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
          functions: { path: __filename, exportName: 'test2Functions' },
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

export const test3Functions: Type = (server) => ({
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
          functions: { path: __filename, exportName: 'test3Functions' },
          server,
        })
      ),
      then(() => client.db.getDoc({ key: { collection: 'detection', id: '1' } }))
    ),
  toResult: either.right(option.none),
};
