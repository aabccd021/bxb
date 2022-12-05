import { ioRef, option, task, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { AuthState, Stack } from '../..';

export const fromOnAuthStateChanged =
  <T>(
    onAuthStateChanged: (t: T) => Stack.client.auth.OnAuthStateChanged.Fn
  ): ((t: T) => Stack.client.auth.GetAuthState.Fn) =>
  (env) =>
    pipe(
      ioRef.newIORef<AuthState>(option.none),
      task.fromIO,
      task.chain((authStateRef) =>
        pipe(
          task.fromIO(onAuthStateChanged(env)(authStateRef.write)),
          task.chain((unsubscribe) => task.fromIO(unsubscribe)),
          task.chain(() => task.fromIO(authStateRef.read))
        )
      ),
      taskEither.fromTask
    );
