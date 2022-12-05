import { io, ioRef, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { AuthState, Stack } from '../..';

export const fromOnAuthStateChanged =
  <T>(
    onAuthStateChanged: (t: T) => Stack.client.auth.OnAuthStateChanged.Fn
  ): ((t: T) => Stack.client.auth.GetAuthState.Fn) =>
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
