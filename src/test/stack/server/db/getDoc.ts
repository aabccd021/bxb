import { either, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { DeepPick } from 'ts-essentials/dist/types';

import type { Stack } from '../../../..';
import { defineTest } from '../../../util';

export const test0002 = defineTest({
  name: 'can upsert and get doc',
  expect: ({
    server,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly server: { readonly db: { readonly upsertDoc: never; readonly getDoc: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              create: { type: 'True' },
              get: { type: 'True' },
            },
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

export const test0003 = defineTest({
  name: 'can get doc even if client.db.getDoc is forbidden by security rule',
  expect: ({
    server,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly server: { readonly db: { readonly upsertDoc: never; readonly getDoc: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              create: { type: 'True' },
            },
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

export const test0004 = defineTest({
  name: 'can get doc if forbidden, even if client.db.getDoc is the doc absent',
  expect: ({
    server,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly server: { readonly db: { readonly getDoc: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
          },
        },
      }),
      taskEither.chainW(() => server.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
    ),
  toResult: either.right(option.none),
});

export const test0005 = defineTest({
  name: 'can get doc created with client.db.usertDoc',
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly server: { readonly db: { readonly getDoc: never } };
      readonly client: { readonly db: { readonly upsertDoc: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
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

export const test0006 = defineTest({
  name: 'can get doc updated with client.db.upsertDoc',
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly server: { readonly db: { readonly getDoc: never } };
      readonly client: { readonly db: { readonly upsertDoc: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              create: { type: 'True' },
              update: { type: 'True' },
            },
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
