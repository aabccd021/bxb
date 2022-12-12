import { either, ioRef, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { AuthState } from '../../../../type';
import type { Suite } from '../../../util';
import { defineTest } from '../../../util';

export const suite: Suite = {
  name: 'client.auth.createUserAndSignInWithEmailAndPassword',
  tests: [
    defineTest({
      name: 'changes auth state to signed',
      expect: ({ client }) =>
        pipe(
          taskEither.Do,
          taskEither.bindW('authStateRef', () =>
            taskEither.fromIO(ioRef.newIORef<AuthState>(option.none))
          ),
          taskEither.chainFirstW(({ authStateRef }) =>
            taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write))
          ),
          taskEither.chainFirstW(() =>
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            })
          ),
          taskEither.chainW(({ authStateRef }) => taskEither.fromIO(authStateRef.read)),
          taskEither.map(option.map(() => 'some user id'))
        ),
      toResult: either.right(option.some('some user id')),
    }),
  ],
};
