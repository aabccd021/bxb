import { io, ioOption, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { getItem } from '../../util';
import { authLocalStorageKey } from './util';

type Type = Stack['client']['auth']['onAuthStateChanged'];

export const onAuthStateChanged: Type = (env) => (onChangedCallback) =>
  pipe(
    getItem(env.getWindow, authLocalStorageKey),
    ioOption.map((uid) => ({ uid })),
    io.chain(onChangedCallback),
    io.chain(() => env.onAuthStateChangedCallback.write(option.some(onChangedCallback))),
    io.map(() => env.onAuthStateChangedCallback.write(option.none))
  );
