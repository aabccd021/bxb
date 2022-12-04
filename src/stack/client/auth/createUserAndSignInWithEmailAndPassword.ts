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
        readonlyRecord.traverse(taskEither.ApplicativeSeq)((fn) =>
          fn.handler({ authUser: { uid: param.email } })
        ),
        taskEither.bimap(
          (value) => ({ code: 'ProviderError' as const, value }),
          () => undefined
        )
      )
    )
  );
