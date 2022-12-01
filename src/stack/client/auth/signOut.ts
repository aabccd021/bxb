import { taskEither } from 'fp-ts';
import { io, ioOption, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { removeItem } from '../../util';
import { authLocalStorageKey } from './util';
type Type = Stack['client']['auth']['signOut'];

export const signOut: Type = (env) =>
  pipe(
    env.onAuthStateChangedCallback.read,
    ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.none)),
    io.chain(() => removeItem(env.getWindow, authLocalStorageKey)),
    taskEither.fromIO
  );
