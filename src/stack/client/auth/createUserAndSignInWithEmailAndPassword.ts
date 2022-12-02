import { either, io, ioEither, ioOption, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { getItem, setItem } from '../../util';
import { authLocalStorageKey } from './util';

type Type = Stack['client']['auth']['createUserAndSignInWithEmailAndPassword'];

export const createUserAndSignInWithEmailAndPassword: Type = (env) => (param) =>
  pipe(
    getItem(env.getWindow, authLocalStorageKey),
    ioOption.match(
      () => either.right(undefined),
      () => either.left({ code: 'EmailAlreadyInUse' as const })
    ),
    ioEither.chainIOK(() =>
      pipe(
        env.onAuthStateChangedCallback.read,
        ioOption.chainIOK((onChangedCallback) =>
          onChangedCallback(option.some({ uid: param.email }))
        ),
        io.chain(() => setItem(env.getWindow, authLocalStorageKey, param.email))
      )
    ),
    taskEither.fromIOEither
  );
