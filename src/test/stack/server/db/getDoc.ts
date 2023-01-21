import { either, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { test } from '../../../util';

export const test0002 = test({
  name: 'can upsert and get doc',
  stack: { server: { db: { upsertDoc: true, getDoc: true } }, ci: { deployDb: true } },
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
});

export const test0003 = test({
  name: 'can get doc even if client.db.getDoc is forbidden by security rule',
  stack: { server: { db: { upsertDoc: true, getDoc: true } }, ci: { deployDb: true } },
  expect: ({ server, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { create: { type: 'True' } },
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
});

export const test0004 = test({
  name: 'can get doc if forbidden, even if client.db.getDoc is the doc absent',
  stack: { server: { db: { getDoc: true } }, ci: { deployDb: true } },
  expect: ({ server, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: { user: { schema: { name: { type: 'StringField' } } } },
      }),
      taskEither.chainW(() => server.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
    ),
  toResult: either.right(option.none),
});

export const test0005 = test({
  name: 'can get doc created with client.db.usertDoc',
  stack: {
    server: { db: { getDoc: true } },
    client: { db: { upsertDoc: true } },
    ci: { deployDb: true },
  },
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { create: { type: 'True' } },
          },
        },
      }),
      taskEither.chainW(() =>
        client.db.upsertDoc({
          key: { collection: 'user', id: 'kira_id' },
          data: { name: 'masumoto' },
        })
      ),
      taskEither.chainW(() => server.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
    ),
  toResult: either.right(option.some({ name: 'masumoto' })),
});

export const test0006 = test({
  name: 'can get doc updated with client.db.upsertDoc',
  stack: {
    server: { db: { getDoc: true } },
    client: { db: { upsertDoc: true } },
    ci: { deployDb: true },
  },
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { create: { type: 'True' }, update: { type: 'True' } },
          },
        },
      }),
      taskEither.chainW(() =>
        client.db.upsertDoc({
          key: { collection: 'user', id: 'kira_id' },
          data: { name: 'masumoto' },
        })
      ),
      taskEither.chainW(() =>
        client.db.upsertDoc({
          key: { collection: 'user', id: 'kira_id' },
          data: { name: 'masumoto' },
        })
      ),
      taskEither.chainW(() => server.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
    ),
  toResult: either.right(option.some({ name: 'masumoto' })),
});
