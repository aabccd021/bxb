import { io, ioRef, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { AuthState, StackWithEnv } from '../..';

export const fromOnAuthStateChanged =
  <T>(
    onAuthStateChanged: StackWithEnv<T>['client']['auth']['onAuthStateChanged']
  ): StackWithEnv<T>['client']['auth']['getAuthState'] =>
  (env) =>
    pipe(
      ioRef.newIORef<AuthState>(option.none),
      io.chain((authStateRef) =>
        pipe(
          onAuthStateChanged(env)(authStateRef.write),
          io.chain((unsubscribe) => unsubscribe),
          io.chain(() => authStateRef.read)
        )
      ),
      taskEither.fromIO
    );
