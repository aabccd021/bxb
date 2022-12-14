import { either, io, ioEither, ioOption, option, readonlyRecord, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { getItem, setItem } from '../../util';
import { authLocalStorageKey } from '../util';

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
        io.chain(() => setItem(env.getWindow, authLocalStorageKey, param.email)),
        io.chain(() => env.functions.read)
      )
    ),
    taskEither.fromIOEither,
    taskEither.chainW(
      flow(
        option.map(({ functions }) => functions),
        option.getOrElseW(() => ({})),
        readonlyRecord.filterMap((fn) =>
          fn.trigger === 'onAuthUserCreated'
            ? option.some(fn.handler({ authUser: { uid: param.email } }))
            : option.none
        ),
        readonlyRecord.sequence(taskEither.ApplicativeSeq),
        taskEither.mapLeft((value) => ({ code: 'Provider' as const, value }))
      )
    ),
    taskEither.bimap(
      (err) => ({
        ...err,
        capability: 'client.auth.createUserAndSignInWithEmailAndPassword',
      }),
      () => ({ authUser: { uid: param.email } })
    )
  );
