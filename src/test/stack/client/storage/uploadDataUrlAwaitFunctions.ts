import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { test } from '../../../util';

export const test0000 = test({
  name: 'can upload base64 data url',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrlAwaitFunctions: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.map(() => 'upload success')
    ),
  toResult: either.right('upload success'),
});

export const test0001 = test({
  name: 'can plain text data url',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrlAwaitFunctions: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_key',
          dataUrl: `data:,kira masumoto`,
        })
      ),
      taskEither.map(() => 'upload success')
    ),
  toResult: either.right('upload success'),
});

export const test0002 = test({
  name: 'returns InvalidDataUrlFormat when invalid data url is uploaded',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrlAwaitFunctions: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({ key: 'kira_key', dataUrl: 'invalidDataUrl' })
      )
    ),
  toResult: either.left({
    code: 'InvalidDataUrlFormat',
    capability: 'client.storage.uploadDataUrlAwaitFunctions',
  }),
});

export const test0003 = test({
  name: 'returns Forbidden when create security rule not specified',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrlAwaitFunctions: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({ securityRule: {} }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrlAwaitFunctions',
  }),
});

export const test0004 = test({
  name: 'can upload base64 data url less than constraint',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrlAwaitFunctions: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'LessThan',
              compare: { lhs: { type: 'ObjectSize' }, rhs: { type: 'NumberConstant', value: 2 } },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('a').toString('base64')}`,
        })
      ),
      taskEither.map(() => 'upload success')
    ),
  toResult: either.right('upload success'),
});

export const test0005 = test({
  name: 'returns Forbidden error if uploaded a base64 data url larger than constraint',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrlAwaitFunctions: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'LessThan',
              compare: { lhs: { type: 'ObjectSize' }, rhs: { type: 'NumberConstant', value: 2 } },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('aa').toString('base64')}`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrlAwaitFunctions',
  }),
});

export const test0006 = test({
  name: 'can upload plain text data url less than constraint',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrlAwaitFunctions: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'LessThan',
              compare: { lhs: { type: 'ObjectSize' }, rhs: { type: 'NumberConstant', value: 2 } },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({ key: 'kira_key', dataUrl: `data:,a` })
      ),
      taskEither.map(() => 'upload success')
    ),
  toResult: either.right('upload success'),
});

export const test0007 = test({
  name: 'returns Forbidden error if uploaded a plain text data url larger than constraint',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrlAwaitFunctions: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'LessThan',
              compare: { lhs: { type: 'ObjectSize' }, rhs: { type: 'NumberConstant', value: 2 } },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({ key: 'kira_key', dataUrl: `data:,aa` })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrlAwaitFunctions',
  }),
});

export const test0008 = test({
  name: 'can upload if auth uid equals to document field which document id equals to object id',
  stack: {
    ci: { deployStorage: true },
    client: {
      storage: { uploadDataUrlAwaitFunctions: true },
      auth: { createUserAndSignInWithEmailAndPassword: true },
    },
    server: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'Equal',
              compare: {
                lhs: { type: 'AuthUid' },
                rhs: {
                  type: 'DocumentField',
                  fieldName: { type: 'StringConstant', value: 'ownerUid' },
                  document: {
                    type: 'Document',
                    collection: { type: 'StringConstant', value: 'storageObject' },
                    id: { type: 'ObjectId' },
                  },
                },
              },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainW((authState) =>
        server.db.upsertDoc({
          key: { collection: 'storageObject', id: 'kira_id' },
          data: { ownerUid: authState.authUser.uid },
        })
      ),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_id',
          dataUrl: `data:,kira masumoto`,
        })
      ),
      taskEither.map(() => 'upload success')
    ),
  toResult: either.right('upload success'),
});

export const test0009 = test({
  name: 'returns Forbidden error if not signed in but required in rule',
  stack: {
    ci: { deployStorage: true },
    client: {
      storage: { uploadDataUrlAwaitFunctions: true },
      auth: { createUserAndSignInWithEmailAndPassword: true, signOut: true },
    },
    server: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'Equal',
              compare: {
                lhs: { type: 'AuthUid' },
                rhs: {
                  type: 'DocumentField',
                  fieldName: { type: 'StringConstant', value: 'ownerUid' },
                  document: {
                    type: 'Document',
                    collection: { type: 'StringConstant', value: 'storageObject' },
                    id: { type: 'ObjectId' },
                  },
                },
              },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainW((authState) =>
        server.db.upsertDoc({
          key: { collection: 'storageObject', id: 'kira_id' },
          data: { ownerUid: authState.authUser.uid },
        })
      ),
      taskEither.chainW(() => client.auth.signOut),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_id',
          dataUrl: `data:,kira masumoto`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrlAwaitFunctions',
  }),
});

export const test0010 = test({
  name: 'returns Forbidden error if object document does not exists',
  stack: {
    ci: { deployStorage: true },
    client: {
      storage: { uploadDataUrlAwaitFunctions: true },
      auth: { createUserAndSignInWithEmailAndPassword: true },
    },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'Equal',
              compare: {
                lhs: { type: 'AuthUid' },
                rhs: {
                  type: 'DocumentField',
                  fieldName: { type: 'StringConstant', value: 'ownerUid' },
                  document: {
                    type: 'Document',
                    collection: { type: 'StringConstant', value: 'storageObject' },
                    id: { type: 'ObjectId' },
                  },
                },
              },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_id',
          dataUrl: `data:,kira masumoto`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrlAwaitFunctions',
  }),
});

export const test0011 = test({
  name: 'returns Forbidden error if object document field does not exists',
  stack: {
    ci: { deployStorage: true },
    client: {
      storage: { uploadDataUrlAwaitFunctions: true },
      auth: { createUserAndSignInWithEmailAndPassword: true },
    },
    server: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'Equal',
              compare: {
                lhs: { type: 'AuthUid' },
                rhs: {
                  type: 'DocumentField',
                  fieldName: { type: 'StringConstant', value: 'ownerUid' },
                  document: {
                    type: 'Document',
                    collection: { type: 'StringConstant', value: 'storageObject' },
                    id: { type: 'ObjectId' },
                  },
                },
              },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainW(() =>
        server.db.upsertDoc({ key: { collection: 'storageObject', id: 'kira_id' }, data: {} })
      ),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_id',
          dataUrl: `data:,kira masumoto`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrlAwaitFunctions',
  }),
});

export const test0012 = test({
  name: 'returns Forbidden error if object document field value is not auth uid',
  stack: {
    ci: { deployStorage: true },
    client: {
      storage: { uploadDataUrlAwaitFunctions: true },
      auth: { createUserAndSignInWithEmailAndPassword: true },
    },
    server: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'Equal',
              compare: {
                lhs: { type: 'AuthUid' },
                rhs: {
                  type: 'DocumentField',
                  fieldName: { type: 'StringConstant', value: 'ownerUid' },
                  document: {
                    type: 'Document',
                    collection: { type: 'StringConstant', value: 'storageObject' },
                    id: { type: 'ObjectId' },
                  },
                },
              },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainW(() =>
        server.db.upsertDoc({
          key: { collection: 'storageObject', id: 'kira_id' },
          data: { ownerUid: 'randomAuthUid' },
        })
      ),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_id',
          dataUrl: `data:,kira masumoto`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrlAwaitFunctions',
  }),
});
