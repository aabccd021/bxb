import { either, option, task, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';
import type { DeepPick } from 'ts-essentials';

import type { Stack } from '../../type';
import { defineTest, toFunctionsPath } from '../util';

export const test1 = defineTest({
  name: `onObjectCreated trigger params contains object id with client.storage.uploadDataUrlAwaitFunctions`,
  functionsBuilders: {
    fn1: (server) => ({
      functions: {
        saveCreatedObjects: {
          trigger: 'onObjectCreated',
          handler: (params) =>
            task.delay(1000)(
              server.db.upsertDoc({
                key: { collection: 'storageObject', id: params.object.key },
                data: { exists: 'true' },
              })
            ),
        },
      },
    }),
  },
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: {
        readonly db: { readonly getDocWhen: never };
        readonly storage: { readonly uploadDataUrlAwaitFunctions: never };
      };
      readonly ci: {
        readonly deployDb: never;
        readonly deployStorage: never;
        readonly deployFunctions: never;
      };
      readonly server: { readonly db: { readonly upsertDoc: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [{ type: 'True' }],
        },
      }),
      taskEither.chainW(() =>
        ci.deployDb({
          type: 'deploy',
          collections: {
            storageObject: {
              schema: { exists: { type: 'StringField' } },
              securityRule: { get: { type: 'True' } },
            },
          },
        })
      ),
      taskEither.chainW(() =>
        ci.deployFunctions({
          functions: {
            filePath: toFunctionsPath(__filename),
            exportPath: ['test1', 'functionsBuilders', 'fn1'],
          },
          server,
        })
      ),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_object_id',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.chainTaskK(() =>
        client.db.getDocWhen({
          key: { collection: 'storageObject', id: 'kira_object_id' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ exists: 'true' }),
});

export const test14 = defineTest({
  name: `uploadDataUrl should wait all functions to be finised with client.storage.uploadDataUrlAwaitFunctions`,
  functionsBuilders: {
    fn1: (server) => ({
      functions: {
        saveCreatedObjects: {
          trigger: 'onObjectCreated',
          handler: (params) =>
            task.delay(1000)(
              server.db.upsertDoc({
                key: { collection: 'storageObject', id: params.object.key },
                data: { exists: 'true' },
              })
            ),
        },
      },
    }),
  },
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: {
        readonly deployStorage: never;
        readonly deployDb: never;
        readonly deployFunctions: never;
      };
      readonly client: {
        readonly storage: { readonly uploadDataUrlAwaitFunctions: never };
        readonly db: { readonly getDoc: never };
      };
      readonly server: { readonly db: { readonly upsertDoc: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [{ type: 'True' }],
        },
      }),
      taskEither.chainW(() =>
        ci.deployDb({
          type: 'deploy',
          collections: {
            storageObject: {
              schema: { exists: { type: 'StringField' } },
              securityRule: { get: { type: 'True' } },
            },
          },
        })
      ),
      taskEither.chainW(() =>
        ci.deployFunctions({
          functions: {
            filePath: toFunctionsPath(__filename),
            exportPath: ['test14', 'functionsBuilders', 'fn1'],
          },
          server,
        })
      ),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_object_id',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.chainW(() =>
        client.db.getDoc({
          key: { collection: 'storageObject', id: 'kira_object_id' },
        })
      )
    ),
  toResult: either.right(option.some({ exists: 'true' })),
});

export const test2 = defineTest({
  name: `onObjectCreated trigger params contains object id`,
  functionsBuilders: {
    fn1: (server) => ({
      functions: {
        saveCreatedObjects: {
          trigger: 'onObjectCreated',
          handler: (params) =>
            task.delay(1000)(
              server.db.upsertDoc({
                key: { collection: 'storageObject', id: params.object.key },
                data: { exists: 'true' },
              })
            ),
        },
      },
    }),
  },
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: {
        readonly deployStorage: never;
        readonly deployDb: never;
        readonly deployFunctions: never;
      };
      readonly server: { readonly db: { readonly upsertDoc: never } };
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never };
        readonly db: { readonly getDocWhen: never };
      };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [{ type: 'True' }],
        },
      }),
      taskEither.chainW(() =>
        ci.deployDb({
          type: 'deploy',
          collections: {
            storageObject: {
              schema: { exists: { type: 'StringField' } },
              securityRule: { get: { type: 'True' } },
            },
          },
        })
      ),
      taskEither.chainW(() =>
        ci.deployFunctions({
          functions: {
            filePath: toFunctionsPath(__filename),
            exportPath: ['test2', 'functionsBuilders', 'fn1'],
          },
          server,
        })
      ),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'masumoto_object_id',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.chainTaskK(() =>
        client.db.getDocWhen({
          key: { collection: 'storageObject', id: 'masumoto_object_id' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ exists: 'true' }),
});

export const test24 = defineTest({
  name: `uploadDataUrl should not wait functions to be finished`,
  functionsBuilders: {
    fn1: (server) => ({
      functions: {
        saveCreatedObjects: {
          trigger: 'onObjectCreated',
          handler: (params) =>
            task.delay(1000)(
              server.db.upsertDoc({
                key: { collection: 'storageObject', id: params.object.key },
                data: { exists: 'true' },
              })
            ),
        },
      },
    }),
  },
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never };
        readonly db: { readonly getDoc: never };
      };
      readonly ci: {
        readonly deployFunctions: never;
        readonly deployDb: never;
        readonly deployStorage: never;
      };
      readonly server: { readonly db: { readonly upsertDoc: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: {
          create: [{ type: 'True' }],
        },
      }),
      taskEither.chainW(() =>
        ci.deployDb({
          type: 'deploy',
          collections: {
            storageObject: {
              schema: { exists: { type: 'StringField' } },
              securityRule: { get: { type: 'True' } },
            },
          },
        })
      ),
      taskEither.chainW(() =>
        ci.deployFunctions({
          functions: {
            filePath: toFunctionsPath(__filename),
            exportPath: ['test24', 'functionsBuilders', 'fn1'],
          },
          server,
        })
      ),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_object_id',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.chainW(() =>
        client.db.getDoc({
          key: { collection: 'storageObject', id: 'kira_object_id' },
        })
      )
    ),
  toResult: either.right(option.none),
});

export const test3 = defineTest({
  name: `onObjectCreated trigger should not be called if not triggered`,
  type: 'fail',
  functionsBuilders: {
    fn1: (server) => ({
      functions: {
        saveCreatedObjects: {
          trigger: 'onObjectCreated',
          handler: (params) =>
            task.delay(1000)(
              server.db.upsertDoc({
                key: { collection: 'storageObject', id: params.object.key },
                data: { exists: 'true' },
              })
            ),
        },
      },
    }),
  },
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly getDocWhen: never } };
      readonly ci: { readonly deployFunctions: never; readonly deployDb: never };
      readonly server: { readonly db: { readonly upsertDoc: never } };
    }
  >) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          detection: {
            schema: { exists: { type: 'StringField' } },
            securityRule: { get: { type: 'True' } },
          },
        },
      }),
      taskEither.chainW(() =>
        ci.deployFunctions({
          functions: {
            filePath: toFunctionsPath(__filename),
            exportPath: ['test3', 'functionsBuilders', 'fn1'],
          },
          server,
        })
      ),
      taskEither.chainTaskK(() =>
        client.db.getDocWhen({
          key: { collection: 'storageObject', id: 'kira_object_id' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ exists: 'true' }),
});

export const test4 = defineTest({
  name: `document should not be created if trigger not deployed`,
  type: 'fail',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployDb: never };
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never };
        readonly db: { readonly getDocWhen: never };
      };
    }
  >) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          storageObject: {
            schema: { exists: { type: 'StringField' } },
            securityRule: { get: { type: 'True' } },
          },
        },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_object_id',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.chainTaskK(() =>
        client.db.getDocWhen({
          key: { collection: 'storageObject', id: 'kira_object_id' },
          select: either.match(() => option.none, identity),
        })
      )
    ),
  toResult: either.right({ exists: 'true' }),
});
