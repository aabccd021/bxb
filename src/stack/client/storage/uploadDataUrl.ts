import { either, ioEither, option, readonlyRecord, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import isValidDataUrl from 'valid-data-url';

import type { Stack } from '../../type';
import { setItem } from '../../util';
import { storageKey } from './util';
type Type = Stack['client']['storage']['uploadDataUrl'];

export const uploadDataUrl: Type = (env) => (param) =>
  pipe(
    param.dataUrl,
    either.fromPredicate(isValidDataUrl, () => ({ code: 'InvalidDataUrlFormat' as const })),
    ioEither.fromEither,
    ioEither.chainIOK((data) => setItem(env.getWindow, `${storageKey}/${param.key}`, data)),
    taskEither.fromIOEither,
    taskEither.chainIOK(() => env.functions.read),
    taskEither.chainW(
      flow(
        option.map(({ functions }) => functions),
        option.getOrElseW(() => ({})),
        readonlyRecord.filterMap((fn) =>
          fn.trigger === 'onObjectCreated'
            ? option.some(fn.handler({ object: { key: param.key } }))
            : option.none
        ),
        readonlyRecord.sequence(taskEither.ApplicativeSeq),
        taskEither.bimap(
          (value) => ({ code: 'ProviderError' as const, value }),
          () => undefined
        )
      )
    ),
    taskEither.mapLeft((err) => ({
      ...err,
      capability: 'client.storage.uploadDataUrl',
    }))
  );
