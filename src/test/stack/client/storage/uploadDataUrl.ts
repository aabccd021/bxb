import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { identity } from 'io-ts';
import fetch from 'node-fetch';

import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'can upload data url and get download url',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployStorage({ securityRule: { type: 'allowAll' } }),
        taskEither.chainW(() =>
          client.storage.uploadDataUrl({
            key: 'kira_key',
            dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
          })
        ),
        taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
        taskEither.chainW((url) => taskEither.tryCatch(() => fetch(url), identity)),
        taskEither.chainW((downloadResult) =>
          taskEither.tryCatch(() => downloadResult.text(), identity)
        )
      ),
    toResult: either.right('kira masumoto'),
  }),

  defineTest({
    name: 'return left on invalid dataUrl upload',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployStorage({ securityRule: { type: 'allowAll' } }),
        taskEither.chainW(() =>
          client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: 'invalidDataUrl' })
        )
      ),
    toResult: either.left({ code: 'InvalidDataUrlFormat' }),
  }),
];
