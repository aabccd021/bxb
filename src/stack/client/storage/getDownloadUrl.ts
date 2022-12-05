import { either, io, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { getItem } from '../../util';
import { storageKey } from './util';
type Type = Stack['client']['storage']['getDownloadUrl'];

export const getDownloadUrl: Type = (env) => (param) =>
  pipe(
    getItem(env.getWindow, `${storageKey}/${param.key}`),
    io.map(either.fromOption(() => ({ code: 'FileNotFound' as const }))),
    taskEither.fromIOEither
  );
