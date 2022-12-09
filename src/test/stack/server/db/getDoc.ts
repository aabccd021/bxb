import { either, option } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'server API can upsert and get doc',
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
    name: 'server db API can get doc even if forbidden by security rule',
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
    name: 'server db API can get doc if forbidden, even if the doc absent',
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
    name: 'can upsert on client and get doc on server',
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
];
