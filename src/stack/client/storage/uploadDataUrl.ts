import { either, ioEither, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import isValidDataUrl from 'valid-data-url';

import { UploadDataUrlError } from '../../../type';
import type { Stack } from '../../type';
import { setItem } from '../../util';
import { storageKey } from './util';
type Type = Stack['client']['storage']['uploadDataUrl'];

export const uploadDataUrl: Type = (env) => (param) =>
  pipe(
    param.dataUrl,
    either.fromPredicate(isValidDataUrl, () =>
      UploadDataUrlError.Union.of.InvalidDataUrlFormat({})
    ),
    ioEither.fromEither,
    ioEither.chainIOK((data) => setItem(env.getWindow, `${storageKey}/${param.key}`, data)),
    taskEither.fromIOEither
  );
