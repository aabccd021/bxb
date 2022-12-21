import { either, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const test0001 = defineTest({
  name: 'returns signed out as default auth state',
  stack: { client: { auth: { getAuthState: true } } },
  expect: ({ client }) => client.auth.getAuthState,
  toResult: either.right(option.none),
});

export const test0002 = defineTest({
  name: 'returns singed in state after client.auth.createUserAndSignInWithEmailAndPassword',
  stack: {
    client: {
      auth: { getAuthState: true, createUserAndSignInWithEmailAndPassword: true },
    },
  },
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
});

export const test0003 = defineTest({
  name: `returns authUser uid same as the one returned from client.auth.createUserAndSignInWithEmailAndPassword`,
  stack: {
    client: { auth: { createUserAndSignInWithEmailAndPassword: true, getAuthState: true } },
  },
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
});

export const test0004 = defineTest({
  name: `returns singed out state after client.auth.createUserAndSignInWithEmailAndPassword then client.auth.signOut`,
  stack: {
    client: {
      auth: { signOut: true, getAuthState: true, createUserAndSignInWithEmailAndPassword: true },
    },
  },
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
});
