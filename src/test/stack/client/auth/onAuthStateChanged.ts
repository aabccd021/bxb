import { either, ioRef, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { AuthState } from '../../../..';
import { test } from '../../../util';

export const test0001 = test({
  name: 'returns signed out as default auth state',
  stack: { client: { auth: { onAuthStateChanged: true } } },
  expect: ({ client }) =>
    pipe(
      taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
      taskEither.bindTo('authStateRef'),
      taskEither.bind('unsubscribe', ({ authStateRef }) =>
        taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write))
      ),
      taskEither.chainFirstW(({ unsubscribe }) => taskEither.fromIO(unsubscribe)),
      taskEither.chainW(({ authStateRef }) => taskEither.fromIO(authStateRef.read))
    ),
  toResult: either.right(option.none),
});

export const test0002 = test({
  name: 'returns singed in state after client.auth.createUserAndSignInWithEmailAndPassword',
  stack: {
    client: {
      auth: {
        createUserAndSignInWithEmailAndPassword: true,
        onAuthStateChanged: true,
      },
    },
  },
  expect: ({ client }) =>
    pipe(
      taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
      taskEither.bindTo('authStateRef'),
      taskEither.chainFirstW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.bind('unsubscribe', ({ authStateRef }) =>
        taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write))
      ),
      taskEither.chainFirstW(({ unsubscribe }) => taskEither.fromIO(unsubscribe)),
      taskEither.chainW(({ authStateRef }) => taskEither.fromIO(authStateRef.read)),
      taskEither.map(option.map(() => 'some auth state'))
    ),
  toResult: either.right(option.some('some auth state')),
});

export const test0003 = test({
  name: `returns singed out state after client.auth.createUserAndSignInWithEmailAndPassword then client.auth.signOut then subscribe`,
  stack: {
    client: {
      auth: {
        createUserAndSignInWithEmailAndPassword: true,
        onAuthStateChanged: true,
        signOut: true,
      },
    },
  },
  expect: ({ client }) =>
    pipe(
      taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
      taskEither.bindTo('authStateRef'),
      taskEither.chainFirstW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainFirstW(() => client.auth.signOut),
      taskEither.bind('unsubscribe', ({ authStateRef }) =>
        taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write))
      ),
      taskEither.chainFirstW(({ unsubscribe }) => taskEither.fromIO(unsubscribe)),
      taskEither.chainW(({ authStateRef }) => taskEither.fromIO(authStateRef.read))
    ),
  toResult: either.right(option.none),
});

export const test0004 = test({
  name: `returns singed out state after subscribe and client.auth.createUserAndSignInWithEmailAndPassword then client.auth.signOut`,
  stack: {
    client: {
      auth: {
        createUserAndSignInWithEmailAndPassword: true,
        onAuthStateChanged: true,
        signOut: true,
      },
    },
  },
  expect: ({ client }) =>
    pipe(
      taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
      taskEither.bindTo('authStateRef'),
      taskEither.bind('unsubscribe', ({ authStateRef }) =>
        taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write))
      ),
      taskEither.chainFirstW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainFirstW(() => client.auth.signOut),
      taskEither.chainFirstW(({ unsubscribe }) => taskEither.fromIO(unsubscribe)),
      taskEither.chainW(({ authStateRef }) => taskEither.fromIO(authStateRef.read))
    ),
  toResult: either.right(option.none),
});

export const test0005 = test({
  name: `returns singed out state after client.auth.createUserAndSignInWithEmailAndPassword then subscribe then client.auth.signOut`,
  stack: {
    client: {
      auth: {
        createUserAndSignInWithEmailAndPassword: true,
        onAuthStateChanged: true,
        signOut: true,
      },
    },
  },
  expect: ({ client }) =>
    pipe(
      taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
      taskEither.bindTo('authStateRef'),
      taskEither.chainFirstW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.bind('unsubscribe', ({ authStateRef }) =>
        taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write))
      ),
      taskEither.chainFirstW(() => client.auth.signOut),
      taskEither.chainFirstW(({ unsubscribe }) => taskEither.fromIO(unsubscribe)),
      taskEither.chainW(({ authStateRef }) => taskEither.fromIO(authStateRef.read))
    ),
  toResult: either.right(option.none),
});

export const test0006 = test({
  name: 'does not call onAuthStateChanged callback after unsubscribed',
  stack: {
    client: {
      auth: {
        createUserAndSignInWithEmailAndPassword: true,
        onAuthStateChanged: true,
      },
    },
  },
  expect: ({ client }) =>
    pipe(
      taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
      taskEither.bindTo('authStateRef'),
      taskEither.bind('unsubscribe', ({ authStateRef }) =>
        taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write))
      ),
      taskEither.chainFirstW(({ unsubscribe }) => taskEither.fromIO(unsubscribe)),
      taskEither.chainFirstW(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      taskEither.chainW(({ authStateRef }) => taskEither.fromIO(authStateRef.read))
    ),
  toResult: either.right(option.none),
});
