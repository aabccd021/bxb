import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'client.db.upsertDoc returns ForbiddenError if update rule is not specified',
    expect: ({ client, ci }) =>
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
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: 'client.db.upsertDoc can create doc',
    expect: ({ client, ci }) =>
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
        taskEither.chainW(() => taskEither.right('upload success'))
      ),
    toResult: either.right('upload success'),
  }),

  defineTest({
    name: 'client.db.upsertDoc fails to upsert doc if not explicitly allowed',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
          },
        }),
        taskEither.chainW(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: 'fail upsert doc if string given when int field required',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'IntField' } },
            securityRule: { create: { type: 'True' } },
          },
        }),
        taskEither.chainW(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: 'fail upsert doc if int given when string field required',
    expect: ({ client, ci }) =>
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
            data: { name: 46 },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: 'fail upsert doc if schema not specified',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: {},
            securityRule: { create: { type: 'True' } },
          },
        }),
        taskEither.chainW(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: `can create tweet if owner field value is owner's auth uid`,
    expect: ({ client, ci }) =>
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
          client.auth.createUserAndSignInWithEmailAndPassword({
            email: 'kira@sakurazaka.com',
            password: 'dorokatsu',
          })
        ),
        taskEither.chainW(() => client.auth.getAuthState),
        taskEither.chainEitherKW(either.fromOption(() => ({ code: 'user not signed in' }))),
        taskEither.chainW((authUser) =>
          client.db.upsertDoc({
            key: { collection: 'tweet', id: '1' },
            data: { owner: authUser.uid },
          })
        ),
        taskEither.map(() => 'upsert success')
      ),
    toResult: either.right('upsert success'),
  }),

  defineTest({
    name: `can not create tweet if owner field value is not owner's auth uid, even if signed in`,
    expect: ({ client, ci }) =>
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
          client.auth.createUserAndSignInWithEmailAndPassword({
            email: 'kira@sakurazaka.com',
            password: 'dorokatsu',
          })
        ),
        taskEither.chainW(() => client.auth.getAuthState),
        taskEither.chainEitherKW(either.fromOption(() => ({ code: 'user not signed in' }))),
        taskEither.chainW(() =>
          client.db.upsertDoc({
            key: { collection: 'tweet', id: '1' },
            data: { owner: 'random auth user uid' },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: `can not create tweet if not signed in`,
    expect: ({ client, ci }) =>
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
          client.db.upsertDoc({
            key: { collection: 'tweet', id: '1' },
            data: { owner: 'random auth user uid' },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: `can not create tweet if not signed in, swap comparation`,
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          tweet: {
            schema: { owner: { type: 'StringField' } },
            securityRule: {
              create: {
                type: 'Equal',
                compare: [{ type: 'DocumentField', fieldName: 'owner' }, { type: 'AuthUid' }],
              },
            },
          },
        }),
        taskEither.chainW(() =>
          client.db.upsertDoc({
            key: { collection: 'tweet', id: '1' },
            data: { owner: 'random auth user uid' },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),
];
