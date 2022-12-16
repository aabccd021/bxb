import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const test0001 = defineTest({
  name: 'can upsert doc',
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
      taskEither.chainW(() => taskEither.right('upload success'))
    ),
  toResult: either.right('upload success'),
});

export const test0002 = defineTest({
  name: 'can upsert doc even if client.db.upserDoc is forbidden by security rule',
  expect: ({ server, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { get: { type: 'True' } },
          },
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
});

export const test0003 = defineTest({
  name: `can create doc even if not signed in`,
  expect: ({ server, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          tweet: {
            schema: { owner: { type: 'StringField' } },
            securityRule: {
              create: {
                type: 'Equal',
                compare: [{ type: 'AuthUid' }, { type: 'DocumentField', fieldName: 'owner' }],
              },
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
});
