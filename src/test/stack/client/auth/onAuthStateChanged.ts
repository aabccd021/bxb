import { either, ioRef, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { AuthState } from '../../../..';
import type { Suite } from '../../../util';
import { defineTest } from '../../../util';

export const suite: Suite = {
  name: 'client.auth.onAuthStateChanged',
  tests: [
    defineTest({
      name: 'returns signed out as default auth state',
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
    }),

    defineTest({
      name: 'returns singed in state after client.auth.createUserAndSignInWithEmailAndPassword',
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
    }),

    defineTest({
      name: `returns singed out state after client.auth.createUserAndSignInWithEmailAndPassword then client.auth.signOut then subscribe`,
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
    }),

    defineTest({
      name: `returns singed out state after subscribe and client.auth.createUserAndSignInWithEmailAndPassword then client.auth.signOut`,
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
    }),

    defineTest({
      name: `returns singed out state after client.auth.createUserAndSignInWithEmailAndPassword then subscribe then client.auth.signOut`,
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
    }),

    defineTest({
      name: 'does not call onAuthStateChanged callback after unsubscribed',
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
    }),
  ],
};