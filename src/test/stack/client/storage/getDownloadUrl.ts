/// <reference lib="dom" />
import { either, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';
import type { TaskEither } from 'fp-ts/TaskEither';

import { test } from '../../../util';

type Env = {
  readonly fetch: {
    readonly text: (p: { readonly url: string }) => TaskEither<unknown, string>;
  };
};

const node18Env: Env = {
  fetch: {
    text: ({ url }) => taskEither.tryCatch(() => fetch(url).then((res) => res.text()), identity),
  },
};

export const test0001 = test({
  name: 'can get download url of base64 uploaded with client.storage.getDownloadUrl',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrl: true, getDownloadUrl: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }], get: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
      taskEither.chainW((url) => node18Env.fetch.text({ url }))
    ),
  toResult: either.right('kira masumoto'),
});

export const test0002 = test({
  name: 'can get download url of plain text uploaded with client.storage.getDownloadUrl',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrl: true, getDownloadUrl: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }], get: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: `data:,kira masumoto` })
      ),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
      taskEither.chainW((url) => node18Env.fetch.text({ url }))
    ),
  toResult: either.right('kira masumoto'),
});

export const test0003 = test({
  name: 'returns Forbidden if not allowed',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrl: true, getDownloadUrl: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: `data:,kira masumoto` })
      ),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' }))
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.storage.getDownloadUrl' }),
});

export const test0004 = test({
  name: 'returns Forbidden if not allowed even if the object is absent',
  stack: { ci: { deployStorage: true }, client: { storage: { getDownloadUrl: true } } },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' }))
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.storage.getDownloadUrl' }),
});

export const test0005 = test({
  name: 'can get download url of base64 uploaded with async client.storage.getDownloadUrl',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrlAwaitFunctions: true, getDownloadUrl: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }], get: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_key',
          dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
        })
      ),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
      taskEither.chainW((url) => node18Env.fetch.text({ url }))
    ),
  toResult: either.right('kira masumoto'),
});

export const test0006 = test({
  name: 'can get download url of plain text uploaded with async client.storage.getDownloadUrl',
  stack: {
    ci: { deployStorage: true },
    client: { storage: { uploadDataUrlAwaitFunctions: true, getDownloadUrl: true } },
  },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployStorage({ securityRule: { create: [{ type: 'True' }], get: [{ type: 'True' }] } }),
      taskEither.chainW(() =>
        client.storage.uploadDataUrlAwaitFunctions({
          key: 'kira_key',
          dataUrl: `data:,kira masumoto`,
        })
      ),
      taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
      taskEither.chainW((url) => node18Env.fetch.text({ url }))
    ),
  toResult: either.right('kira masumoto'),
});
