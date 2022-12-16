import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { DeepPick } from 'ts-essentials';

import type { Stack } from '../../../../type';
import { defineTest } from '../../../util';

export const test0001 = defineTest({
  name: 'can upload base64 data url',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: { readonly storage: { readonly uploadDataUrl: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.map(() => 'upload success')
    ),
  toResult: either.right('upload success'),
});

export const test0002 = defineTest({
  name: 'can plain text data url',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: { readonly storage: { readonly uploadDataUrl: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_key',
          dataUrl: `data:,kira masumoto`,
        })
      ),
      taskEither.map(() => 'upload success')
    ),
  toResult: either.right('upload success'),
});

export const test0003 = defineTest({
  name: 'returns InvalidDataUrlFormat when invalid data url is uploaded',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: { readonly storage: { readonly uploadDataUrl: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: 'invalidDataUrl' })
      )
    ),
  toResult: either.left({
    code: 'InvalidDataUrlFormat',
    capability: 'client.storage.uploadDataUrl',
  }),
});

export const test0004 = defineTest({
  name: 'returns Forbidden when create security rule not specified',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: { readonly storage: { readonly uploadDataUrl: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({ securityRule: {} }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrl',
  }),
});

export const test0005 = defineTest({
  name: 'can upload base64 data url less than constraint',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: { readonly storage: { readonly uploadDataUrl: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'LessThan',
              compare: {
                lhs: { type: 'ObjectSize' },
                rhs: { type: 'NumberConstant', value: 2 },
              },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('a').toString('base64')}`,
        })
      ),
      taskEither.map(() => 'upload success')
    ),
  toResult: either.right('upload success'),
});

export const test0006 = defineTest({
  name: 'returns Forbidden error if uploaded a base64 data url larger than constraint',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: { readonly storage: { readonly uploadDataUrl: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'LessThan',
              compare: {
                lhs: { type: 'ObjectSize' },
                rhs: { type: 'NumberConstant', value: 2 },
              },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('aa').toString('base64')}`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrl',
  }),
});

export const test0007 = defineTest({
  name: 'can upload plain text data url less than constraint',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: { readonly storage: { readonly uploadDataUrl: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'LessThan',
              compare: {
                lhs: { type: 'ObjectSize' },
                rhs: { type: 'NumberConstant', value: 2 },
              },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_key',
          dataUrl: `data:,a`,
        })
      ),
      taskEither.map(() => 'upload success')
    ),
  toResult: either.right('upload success'),
});

export const test0008 = defineTest({
  name: 'returns Forbidden error if uploaded a plain text data url larger than constraint',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: { readonly storage: { readonly uploadDataUrl: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [
            {
              type: 'LessThan',
              compare: {
                lhs: { type: 'ObjectSize' },
                rhs: { type: 'NumberConstant', value: 2 },
              },
            },
          ],
        },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_key',
          dataUrl: `data:,aa`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrl',
  }),
});

export const test0009 = defineTest({
  name: 'can upload if auth uid equals to document field which document id equals to object id',
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly server: { readonly db: { readonly upsertDoc: never } };
      readonly ci: { readonly deployStorage: never };
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never };
        readonly auth: { readonly createUserAndSignInWithEmailAndPassword: never };
      };
    }
  >) =>
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
        client.storage.uploadDataUrl({
          key: 'kira_id',
          dataUrl: `data:,kira masumoto`,
        })
      ),
      taskEither.map(() => 'upload success')
    ),
  toResult: either.right('upload success'),
});

export const test0010 = defineTest({
  name: 'returns Forbidden error if not signed in but required in rule',
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly server: { readonly db: { readonly upsertDoc: never } };
      readonly ci: { readonly deployStorage: never };
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never };
        readonly auth: {
          readonly createUserAndSignInWithEmailAndPassword: never;
          readonly signOut: never;
        };
      };
    }
  >) =>
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
        client.storage.uploadDataUrl({
          key: 'kira_id',
          dataUrl: `data:,kira masumoto`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrl',
  }),
});

export const test0011 = defineTest({
  name: 'returns Forbidden error if object document does not exists',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never };
        readonly auth: { readonly createUserAndSignInWithEmailAndPassword: never };
      };
    }
  >) =>
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
        client.storage.uploadDataUrl({
          key: 'kira_id',
          dataUrl: `data:,kira masumoto`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrl',
  }),
});

export const test0012 = defineTest({
  name: 'returns Forbidden error if object document field does not exists',
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly server: { readonly db: { readonly upsertDoc: never } };
      readonly ci: { readonly deployStorage: never };
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never };
        readonly auth: { readonly createUserAndSignInWithEmailAndPassword: never };
      };
    }
  >) =>
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
          data: {},
        })
      ),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_id',
          dataUrl: `data:,kira masumoto`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrl',
  }),
});

export const test0013 = defineTest({
  name: 'returns Forbidden error if object document field value is not auth uid',
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly server: { readonly db: { readonly upsertDoc: never } };
      readonly ci: { readonly deployStorage: never };
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never };
        readonly auth: { readonly createUserAndSignInWithEmailAndPassword: never };
      };
    }
  >) =>
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
        client.storage.uploadDataUrl({
          key: 'kira_id',
          dataUrl: `data:,kira masumoto`,
        })
      )
    ),
  toResult: either.left({
    code: 'Forbidden',
    capability: 'client.storage.uploadDataUrl',
  }),
});
