import { either, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'initial result of getAuthState is signed out',
    expect: ({ client }) => client.auth.getAuthState,
    toResult: either.right(option.none),
  }),

  defineTest({
    name: 'getAuthState returns signed in after sign in',
    expect: ({ client }) =>
      pipe(
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        }),
        taskEither.chainW(() => client.auth.getAuthState),
        taskEither.map(option.isSome)
      ),
    toResult: either.right(true),
  }),

  defineTest({
    name: 'getAuthState returns signed out after sign in and then sign out',
    expect: ({ client }) =>
      pipe(
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        }),
        taskEither.chainW(() => client.auth.signOut),
        taskEither.chainW(() => client.auth.getAuthState)
      ),
    toResult: either.right(option.none),
  }),
];
