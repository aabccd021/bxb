import { either, ioRef, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { AuthState } from '../../../../type';
import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'auth state changes to signed in after sign in',
    expect: ({ client }) =>
      pipe(
        taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
        taskEither.chainW((authStateRef) =>
          pipe(
            taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write)),
            taskEither.chainW(() =>
              client.auth.createUserAndSignInWithEmailAndPassword({
                email: 'kira@sakurazaka.com',
                password: 'dorokatsu',
              })
            ),
            taskEither.chainW(() => taskEither.fromIO(authStateRef.read))
          )
        ),
        taskEither.map(option.isSome)
      ),
    toResult: either.right(true),
  }),

  defineTest({
    name: 'auth state does not change after unsubscribed',
    expect: ({ client }) =>
      pipe(
        taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
        taskEither.chainW((authStateRef) =>
          pipe(
            taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write)),
            taskEither.chainW((unsubscribe) => taskEither.fromIO(unsubscribe)),
            taskEither.chainW(() =>
              client.auth.createUserAndSignInWithEmailAndPassword({
                email: 'kira@sakurazaka.com',
                password: 'dorokatsu',
              })
            ),
            taskEither.chainW(() => taskEither.fromIO(authStateRef.read))
          )
        )
      ),
    toResult: either.right(option.none),
  }),
];
