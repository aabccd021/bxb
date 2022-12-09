import { either } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'can upsert doc',
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
    name: 'can upsert doc even if forbidden by security rule',
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
    name: `can create doc even if not signed in`,
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
];
