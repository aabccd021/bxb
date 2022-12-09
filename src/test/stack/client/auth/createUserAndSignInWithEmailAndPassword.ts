import { either, ioRef, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { AuthState } from '../../../../type';
import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'changes auth state to signed',
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
        taskEither.map(option.map(() => 'some user id'))
      ),
    toResult: either.right(option.some('some user id')),
  }),
];
