import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const test0001 = defineTest({
  name: 'returns Forbidden when creating doc if create rule is not specified',
  stack: {
    ci: { deployDb: true },
    client: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: { user: { schema: { name: { type: 'StringField' } } } },
      }),
      taskEither.chainW(() =>
        client.db.upsertDoc({
          key: { collection: 'user', id: 'kira_id' },
          data: { name: 'masumoto' },
        })
      )
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.db.upsertDoc' }),
});

export const test0002 = defineTest({
  name: 'returns Forbidden when updating doc if update rule is not specified',
  stack: {
    ci: { deployDb: true },
    client: { db: { upsertDoc: true } },
  },
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
      taskEither.chainW(() =>
        client.db.upsertDoc({
          key: { collection: 'user', id: 'kira_id' },
          data: { name: 'dorokatsu' },
        })
      )
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.db.upsertDoc' }),
});

export const test0003 = defineTest({
  name: 'can create doc',
  stack: {
    ci: { deployDb: true },
    client: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci }) =>
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
      taskEither.chainW(() => taskEither.right('upload success'))
    ),
  toResult: either.right('upload success'),
});

export const test0004 = defineTest({
  name: 'returns Forbidden when creating doc if string given when int field required',
  stack: {
    ci: { deployDb: true },
    client: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'IntField' } },
            securityRule: { create: { type: 'True' } },
          },
        },
      }),
      taskEither.chainW(() =>
        client.db.upsertDoc({
          key: { collection: 'user', id: 'kira_id' },
          data: { name: 'masumoto' },
        })
      )
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.db.upsertDoc' }),
});

export const test0005 = defineTest({
  name: 'returns Forbidden when creating doc if int given when string field required',
  stack: {
    ci: { deployDb: true },
    client: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci }) =>
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
        client.db.upsertDoc({ key: { collection: 'user', id: 'kira_id' }, data: { name: 46 } })
      )
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.db.upsertDoc' }),
});

export const test0006 = defineTest({
  name: 'returns Forbidden when creating doc if schema not specified',
  stack: {
    ci: { deployDb: true },
    client: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: { user: { schema: {}, securityRule: { create: { type: 'True' } } } },
      }),
      taskEither.chainW(() =>
        client.db.upsertDoc({
          key: { collection: 'user', id: 'kira_id' },
          data: { name: 'masumoto' },
        })
      )
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.db.upsertDoc' }),
});

export const test0007 = defineTest({
  name: `can create doc if owner field value is owner's auth uid`,
  stack: {
    ci: { deployDb: true },
    client: {
      db: { upsertDoc: true },
      auth: { createUserAndSignInWithEmailAndPassword: true },
    },
  },
  expect: ({ client, ci }) =>
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
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainW((signInResult) =>
        client.db.upsertDoc({
          key: { collection: 'tweet', id: '1' },
          data: { owner: signInResult.authUser.uid },
        })
      ),
      taskEither.map(() => 'upsert success')
    ),
  toResult: either.right('upsert success'),
});

export const test0008 = defineTest({
  name: `returns ForbidenError if owner field value is not owner's auth uid, even if signed in`,
  stack: {
    ci: { deployDb: true },
    client: {
      db: { upsertDoc: true },
      auth: { createUserAndSignInWithEmailAndPassword: true },
    },
  },
  expect: ({ client, ci }) =>
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
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainW(() =>
        client.db.upsertDoc({
          key: { collection: 'tweet', id: '1' },
          data: { owner: 'random auth user uid' },
        })
      )
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.db.upsertDoc' }),
});

export const test0009 = defineTest({
  name: `returns Forbidden if not signed in`,
  stack: {
    ci: { deployDb: true },
    client: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci }) =>
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
        client.db.upsertDoc({
          key: { collection: 'tweet', id: '1' },
          data: { owner: 'random auth user uid' },
        })
      )
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.db.upsertDoc' }),
});

export const test0010 = defineTest({
  name: `returns Forbidden if not signed in, swap comparation`,
  stack: {
    ci: { deployDb: true },
    client: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          tweet: {
            schema: { owner: { type: 'StringField' } },
            securityRule: {
              create: {
                type: 'Equal',
                compare: [{ type: 'DocumentField', fieldName: 'owner' }, { type: 'AuthUid' }],
              },
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
  toResult: either.left({ code: 'Forbidden', capability: 'client.db.upsertDoc' }),
});
