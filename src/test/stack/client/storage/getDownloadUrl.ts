import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { DeepPick } from 'ts-essentials';

import type { Stack } from '../../../..';

const fetch = (url: string) => import('node-fetch').then(({ default: _fetch }) => _fetch(url));

import { defineTest } from '../../../util';

export const test0001 = defineTest({
  name: 'can get download url of base64 uploaded with client.storage.getDownloadUrl',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never; readonly getDownloadUrl: never };
      };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: { create: [{ type: 'True' }], get: [{ type: 'True' }] },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
      taskEither.chainW((url) => taskEither.tryCatch(() => fetch(url), either.toError)),
      taskEither.chainW((downloadResult) =>
        taskEither.tryCatch(() => downloadResult.text(), either.toError)
      )
    ),
  toResult: either.right('kira masumoto'),
});

export const test0002 = defineTest({
  name: 'can get download url of plain text uploaded with client.storage.getDownloadUrl',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never; readonly getDownloadUrl: never };
      };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: { create: [{ type: 'True' }], get: [{ type: 'True' }] },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_key',
          dataUrl: `data:,kira masumoto`,
        })
      ),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
      taskEither.chainW((url) => taskEither.tryCatch(() => fetch(url), either.toError)),
      taskEither.chainW((downloadResult) =>
        taskEither.tryCatch(() => downloadResult.text(), either.toError)
      )
    ),
  toResult: either.right('kira masumoto'),
});

export const test0003 = defineTest({
  name: 'returns Forbidden if not allowed',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: {
        readonly storage: { readonly uploadDataUrl: never; readonly getDownloadUrl: never };
      };
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
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' }))
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.storage.getDownloadUrl' }),
});

export const test0004 = defineTest({
  name: 'returns Forbidden if not allowed even if the object is absent',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: { readonly storage: { readonly getDownloadUrl: never } };
    }
  >) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' }))
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.storage.getDownloadUrl' }),
});

export const test0005 = defineTest({
  name: 'can get download url of base64 uploaded with async client.storage.getDownloadUrl',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: {
        readonly storage: {
          readonly uploadDataUrlAwaitFunctions: never;
          readonly getDownloadUrl: never;
        };
      };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: { create: [{ type: 'True' }], get: [{ type: 'True' }] },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
      taskEither.chainW((url) => taskEither.tryCatch(() => fetch(url), either.toError)),
      taskEither.chainW((downloadResult) =>
        taskEither.tryCatch(() => downloadResult.text(), either.toError)
      )
    ),
  toResult: either.right('kira masumoto'),
});

export const test0006 = defineTest({
  name: 'can get download url of plain text uploaded with async client.storage.getDownloadUrl',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly ci: { readonly deployStorage: never };
      readonly client: {
        readonly storage: {
          readonly uploadDataUrlAwaitFunctions: never;
          readonly getDownloadUrl: never;
        };
      };
    }
  >) =>
    pipe(
      ci.deployStorage({
        securityRule: { create: [{ type: 'True' }], get: [{ type: 'True' }] },
      }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_key',
          dataUrl: `data:,kira masumoto`,
        })
      ),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
      taskEither.chainW((url) => taskEither.tryCatch(() => fetch(url), either.toError)),
      taskEither.chainW((downloadResult) =>
        taskEither.tryCatch(() => downloadResult.text(), either.toError)
      )
    ),
  toResult: either.right('kira masumoto'),
});
