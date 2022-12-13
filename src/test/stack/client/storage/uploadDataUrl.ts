import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Suite } from '../../../util';
import { defineTest } from '../../../util';

export const suite: Suite = {
  name: 'client.storage.uploadDataUrl',
  tests: [
    defineTest({
      name: 'can upload data url',
      expect: ({ client, ci }) =>
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
    }),

    defineTest({
      name: 'returns InvalidDataUrlFormat when invalid data url is uploaded',
      expect: ({ client, ci }) =>
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
    }),

    defineTest({
      name: 'returns Forbidden error when create security rule not specified',
      expect: ({ client, ci }) =>
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
    }),

    defineTest({
      name: 'can upload object less than constraint',
      expect: ({ client, ci }) =>
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
    }),

    defineTest({
      name: 'returns Forbidden if uploaded an object larger than constraint',
      expect: ({ client, ci }) =>
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
    }),
  ],
};
