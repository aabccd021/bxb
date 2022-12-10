import { either, option } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Suite } from '../../../util';
import { defineTest } from '../../../util';

export const suite: Suite = {
  name: 'server.db.getDoc',
  tests: [
    defineTest({
      name: 'can upsert and get doc',
      expect: ({ server, ci }) =>
        pipe(
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: {
                create: { type: 'True' },
                get: { type: 'True' },
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
      name: 'can get doc even if client.db.getDoc is forbidden by security rule',
      expect: ({ server, ci }) =>
        pipe(
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: {
                create: { type: 'True' },
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
      name: 'can get doc if forbidden, even if client.db.getDoc is the doc absent',
      expect: ({ server, ci }) =>
        pipe(
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
            },
          }),
          taskEither.chainW(() => server.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.none),
    }),

    defineTest({
      name: 'can get doc created with client.db.usertDoc',
      expect: ({ server, client, ci }) =>
        pipe(
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: { create: { type: 'True' } },
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
    }),

    defineTest({
      name: 'can get doc updated with client.db.upsertDoc',
      expect: ({ server, client, ci }) =>
        pipe(
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: {
                create: { type: 'True' },
                update: { type: 'True' },
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
    }),
  ],
};
