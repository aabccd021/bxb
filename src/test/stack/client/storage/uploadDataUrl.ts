import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const tests = [
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
