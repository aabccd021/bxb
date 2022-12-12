import { either, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Suite } from '../../../util';
import { defineTest } from '../../../util';

export const suite: Suite = {
  name: 'client.auth.getAuthState',
  tests: [
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
          taskEither.map(option.map(() => 'some auth state'))
        ),
      toResult: either.right(option.some('some auth state')),
    }),

    defineTest({
      name: `returns authUser uid same as the one returned from client.auth.createUserAndSignInWithEmailAndPassword`,
      expect: ({ client }) =>
        pipe(
          taskEither.Do,
          taskEither.bind('signInResult', () =>
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            })
          ),
          taskEither.bindW('getAuthStateResult', () => client.auth.getAuthState),
          taskEither.map(({ signInResult, getAuthStateResult }) =>
            pipe(
              getAuthStateResult,
              option.map((authUser) => authUser.uid === signInResult.authUser.uid)
            )
          )
        ),
      toResult: either.right(option.some(true)),
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
  ],
};
