import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import fetch from 'node-fetch';

import type { Suite } from '../../../util';
import { defineTest } from '../../../util';

export const suite: Suite = {
  name: 'client.storage.getDownloadUrl',
  tests: [
    defineTest({
      name: 'can get download url of base64 uploaded with client.storage.getDownloadUrl',
      expect: ({ client, ci }) =>
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
    }),

    defineTest({
      name: 'can get download url of plain text uploaded with client.storage.getDownloadUrl',
      expect: ({ client, ci }) =>
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
    }),

    defineTest({
      name: 'returns Forbidden if not allowed',
      expect: ({ client, ci }) =>
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
    }),

    defineTest({
      name: 'returns Forbidden if not allowed even if the object is absent',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
          taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' }))
        ),
      toResult: either.left({ code: 'Forbidden', capability: 'client.storage.getDownloadUrl' }),
    }),

    defineTest({
      name: 'can get download url of base64 uploaded with client.storage.getDownloadUrl',
      expect: ({ client, ci }) =>
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
    }),

    defineTest({
      name: 'can get download url of plain text uploaded with client.storage.getDownloadUrl',
      expect: ({ client, ci }) =>
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
    }),

    defineTest({
      name: 'returns Forbidden if not allowed',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployStorage({ securityRule: { create: [{ type: 'True' }] } }),
          taskEither.chainW(() =>
            client.storage.uploadDataUrlAwaitFunctions({
              key: 'kira_key',
              dataUrl: `data:,kira masumoto`,
            })
          ),
          taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' }))
        ),
      toResult: either.left({ code: 'Forbidden', capability: 'client.storage.getDownloadUrl' }),
    }),
  ],
};
