import { either, ioEither, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
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
    taskEither.mapLeft((err) => ({
      ...err,
      capability: 'client.storage.uploadDataUrl',
    }))
  );
