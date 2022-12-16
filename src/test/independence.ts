import { either, option, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';

import type { DeployFunctionParam, Stack as S } from '../type';
import type { Suite } from './util';
import { toFunctionsPath } from './util';
import { defineTest } from './util';

export const storage: Suite = {
  name: 'storage is independent between tests',
  tests: [
    defineTest({
      name: 'a server can upload file kira',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployStorage({
            securityRule: { create: [{ type: 'True' }], get: [{ type: 'True' }] },
          }),
          taskEither.chainW(() =>
            client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: 'data:,foo' })
          ),
          taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
          taskEither.chainW(() => taskEither.right('download success'))
        ),
      toResult: either.right('download success'),
    }),

    defineTest({
      name: 'server from another test can not access file kira',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployStorage({
            securityRule: { create: [{ type: 'True' }], get: [{ type: 'True' }] },
          }),
          taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
          taskEither.chainW(() => taskEither.right('download success'))
        ),
      toResult: either.left({ code: 'FileNotFound', capability: 'client.storage.getDownloadUrl' }),
    }),
  ],
};

export const db: Suite = {
  name: 'db is independent between tests',
  tests: [
    defineTest({
      name: 'a server can create document kira',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                schema: { name: { type: 'StringField' } },
                securityRule: { create: { type: 'True' }, get: { type: 'True' } },
              },
            },
          }),
          taskEither.chainW(() =>
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.some({ name: 'masumoto' })),
    }),

    defineTest({
      name: 'server from another test can not access document kira',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                schema: { name: { type: 'StringField' } },
                securityRule: { create: { type: 'True' }, get: { type: 'True' } },
              },
            },
          }),
          taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.none),
    }),
  ],
};

export const serverDb: Suite = {
  name: 'db is independent between tests using server API',
  tests: [
    defineTest({
      name: 'a server can create document kira',
      expect: ({ server, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                schema: { name: { type: 'StringField' } },
                securityRule: { create: { type: 'True' }, get: { type: 'True' } },
              },
            },
          }),
          taskEither.chainW(() =>
            server.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(() => server.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.some({ name: 'masumoto' })),
    }),

    defineTest({
      name: 'another test can not access document kira using server API',
      expect: ({ server, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                schema: { name: { type: 'StringField' } },
                securityRule: { create: { type: 'True' }, get: { type: 'True' } },
              },
            },
          }),
          taskEither.chainW(() => server.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.none),
    }),
  ],
};

export const authUser: Suite = {
  name: 'user is independent between test',
  tests: [
    defineTest({
      name: 'a test can create user kira for the first time and return error for the second time',
      expect: ({ client }) =>
        pipe(
          client.auth.createUserAndSignInWithEmailAndPassword({
            email: 'kira@sakurazaka.com',
            password: 'dorokatsu',
          }),
          taskEither.chainW(() =>
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            })
          ),
          taskEither.chainW(() => taskEither.right('create user kira two times success'))
        ),
      toResult: either.left({
        code: 'EmailAlreadyInUse',
        capability: 'client.auth.createUserAndSignInWithEmailAndPassword',
      }),
    }),

    defineTest({
      name: 'another test can create the same user',
      expect: ({ client }) =>
        pipe(
          client.auth.createUserAndSignInWithEmailAndPassword({
            email: 'kira@sakurazaka.com',
            password: 'dorokatsu',
          }),
          taskEither.chainW(() => taskEither.right('create user kira success'))
        ),
      toResult: either.right('create user kira success'),
    }),
  ],
};

export const authState: Suite = {
  name: 'sign in state is independent between test',
  tests: [
    defineTest({
      name: 'a test can sign in and change state to signed in',
      expect: ({ client }) =>
        pipe(
          client.auth.createUserAndSignInWithEmailAndPassword({
            email: 'kira@sakurazaka.com',
            password: 'dorokatsu',
          }),
          taskEither.chainW(() => client.auth.getAuthState),
          taskEither.map(option.map(() => 'some auth state'))
        ),
      toResult: either.right(option.some('some auth state')),
    }),

    defineTest({
      name: 'another test should initially signed out',
      expect: ({ client }) => client.auth.getAuthState,
      toResult: either.right(option.none),
    }),
  ],
};

export const functions: Suite = {
  name: 'functions is independent between test',
  tests: [
    {
      name: `a test can deploy trigger`,
      functionsBuilders: {
        fn1: (server: S.server.Type): DeployFunctionParam => ({
          functions: {
            createDocOnAuthCreated: {
              trigger: 'onAuthUserCreated',
              handler: () =>
                server.db.upsertDoc({
                  key: { collection: 'detection', id: '1' },
                  data: { status: 'true' },
                }),
            },
          },
        }),
      },
      expect: ({ client, ci, server }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              detection: {
                schema: { status: { type: 'StringField' } },
                securityRule: { get: { type: 'True' } },
              },
            },
          }),
          taskEither.chainW(() =>
            ci.deployFunctions({
              functions: {
                filePath: toFunctionsPath(__filename),
                exportPath: ['functions', 'tests', 0, 'functionsBuilders', 'fn1'],
              },
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
    },
    {
      name: `another test shouldn't be affected by trigger from another test`,
      type: 'fail',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              detection: {
                schema: { status: { type: 'StringField' } },
                securityRule: { get: { type: 'True' } },
              },
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
    },
  ],
};

export const allSuites = [functions, db, storage, authUser, serverDb, authState];
