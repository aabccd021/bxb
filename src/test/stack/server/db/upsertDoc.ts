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
    name: 'server db API can upsert doc',
    expect: ({ server, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { create: { type: 'True' } },
          },
        }),
        taskEither.chainW(() =>
          server.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        ),
        taskEither.chainW(() => taskEither.right('upload success'))
      ),
    toResult: either.right('upload success'),
  }),

  defineTest({
    name: 'server db API can upsert doc if not explicitly allowed',
    expect: ({ server, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { get: { type: 'True' } },
          },
        }),
        taskEither.chainW(() =>
          server.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        ),
        taskEither.chainW(() => taskEither.right('upload success'))
      ),
    toResult: either.right('upload success'),
  }),

  defineTest({
    name: `server db API can create tweet even if not signed in`,
    expect: ({ server, ci }) =>
      pipe(
        ci.deployDb({
          tweet: {
            schema: { owner: { type: 'StringField' } },
            securityRule: {
              create: {
                type: 'Equal',
                compare: [{ type: 'AuthUid' }, { type: 'DocumentField', fieldName: 'owner' }],
              },
            },
          },
        }),
        taskEither.chainW(() =>
          server.db.upsertDoc({
            key: { collection: 'tweet', id: '1' },
            data: { owner: 'random auth user uid' },
          })
        ),
        taskEither.map(() => 'upsert success')
      ),
    toResult: either.right('upsert success'),
  }),

  defineTest({
    name: 'can upsert on server and get doc on client',
    expect: ({ server, client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
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
        taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
      ),
    toResult: either.right(option.some({ name: 'masumoto' })),
  }),
];
