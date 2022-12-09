import { either, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'returns signed out as default auth state',
    expect: ({ client }) => client.auth.getAuthState,
    toResult: either.right(option.none),
  }),

  defineTest({
    name: 'returns singed in state after client.auth.createUserAndSignInWithEmailAndPassword',
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
    name: `returns singed out state after client.auth.createUserAndSignInWithEmailAndPassword then client.auth.signOut`,
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
