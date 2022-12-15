import { either, option, task, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';

import type { FunctionsBuilder } from '../..';
import type { Suite } from '../util';
import { defineTest } from '../util';

const functionsPath = __filename.replaceAll('masmott/dist/es6', 'masmott/dist/cjs');

export const test1Functions: FunctionsBuilder = (server) => ({
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
});

const test1 = defineTest({
  name: `onObjectCreated trigger params contains object id with client.storage.uploadDataUrlAwaitFunctions`,
  expect: ({ client, ci, server }) =>
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
          functions: { path: functionsPath, exportName: 'test1Functions' },
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

export const test14Functions: FunctionsBuilder = (server) => ({
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
});

const test14 = defineTest({
  name: `uploadDataUrl should wait all functions to be finised with client.storage.uploadDataUrlAwaitFunctions`,
  expect: ({ client, ci, server }) =>
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
          functions: { path: functionsPath, exportName: 'test14Functions' },
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

export const test2Functions: FunctionsBuilder = (server) => ({
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
});

const test2 = defineTest({
  name: `onObjectCreated trigger params contains object id`,
  expect: ({ client, ci, server }) =>
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
          functions: { path: functionsPath, exportName: 'test2Functions' },
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

export const test24Functions: FunctionsBuilder = (server) => ({
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
});

const test24 = defineTest({
  name: `uploadDataUrl should not wait functions to be finished`,
  expect: ({ client, ci, server }) =>
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
          functions: { path: functionsPath, exportName: 'test24Functions' },
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

export const test3Functions: FunctionsBuilder = (server) => ({
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
});

const test3 = defineTest({
  name: `onObjectCreated trigger should not be called if not triggered`,
  type: 'fail',
  expect: ({ client, ci, server }) =>
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
          functions: { path: functionsPath, exportName: 'test3Functions' },
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

const test4 = defineTest({
  name: `document should not be created if trigger not deployed`,
  type: 'fail',
  expect: ({ client, ci }) =>
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

export const suite: Suite = {
  name: 'onObjectCreated functions',
  tests: [test1, test14, test2, test24, test3, test4],
};
