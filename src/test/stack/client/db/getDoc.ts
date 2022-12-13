import { option, task } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { either } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Suite } from '../../../util';
import { defineTest } from '../../../util';

export const suite: Suite = {
  name: 'client.db.getDoc',
  tests: [
    defineTest({
      name: 'can get doc created with client.db.upsertDoc',
      expect: ({ client, ci }) =>
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
      name: 'always returns the latest doc state',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                schema: { name: { type: 'StringField' } },
                securityRule: {
                  create: { type: 'True' },
                  update: { type: 'True' },
                  get: { type: 'True' },
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
              data: { name: 'dorokatsu' },
            })
          ),
          taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.some({ name: 'dorokatsu' })),
    }),

    defineTest({
      name: `does not returns doc made by forbidden create doc request done with client.db.upsertDoc`,
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                securityRule: {
                  get: { type: 'True' },
                },
                schema: { name: { type: 'StringField' } },
              },
            },
          }),
          taskEither.chainW(() =>
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          task.chain(() =>
            client.db.getDoc({
              key: { collection: 'user', id: 'kira_id' },
            })
          )
        ),
      toResult: either.right(option.none),
    }),

    defineTest({
      name: `does not returns doc made by forbidden update doc request done with client.db.upsertDoc`,
      expect: ({ client, ci }) =>
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
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(() =>
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'dorokatsu' },
            })
          ),
          task.chain(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.some({ name: 'masumoto' })),
    }),

    defineTest({
      name: 'returns ForbiddedError if forbidden',
      expect: ({ client, ci }) =>
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
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.left({ code: 'ForbiddenError', capability: 'client.db.getDoc' }),
    }),

    defineTest({
      name: 'returns ForbiddedError if forbidden, even if the doc absent',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                schema: { name: { type: 'StringField' } },
              },
            },
          }),
          taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.left({ code: 'ForbiddenError', capability: 'client.db.getDoc' }),
    }),

    defineTest({
      name: 'can get doc created by server.db.upsertDoc',
      expect: ({ server, client, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                schema: { name: { type: 'StringField' } },
                securityRule: {
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
          taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.some({ name: 'masumoto' })),
    }),

    defineTest({
      name: 'can get doc updated by server.db.upsertDoc',
      expect: ({ server, client, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                schema: { name: { type: 'StringField' } },
                securityRule: {
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
          taskEither.chainW(() =>
            server.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'kira' },
            })
          ),
          taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.some({ name: 'kira' })),
    }),
  ],
};
