import { either, io, ioRef, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { AuthState } from '../../../..';
import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'returns signed out as default auth state',
    expect: ({ client }) =>
      pipe(
        ioRef.newIORef<AuthState>(option.none),
        io.chain((authStateRef) =>
          pipe(
            client.auth.onAuthStateChanged(authStateRef.write),
            io.chain(() => authStateRef.read)
          )
        ),
        taskEither.fromIO
      ),
    toResult: either.right(option.none),
  }),

  defineTest({
    name: 'returns singed in state after client.auth.createUserAndSignInWithEmailAndPassword',
    expect: ({ client }) =>
      pipe(
        taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
        taskEither.chainW((authStateRef) =>
          pipe(
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            }),
            taskEither.chainW(() =>
              taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write))
            ),
            taskEither.chainW(() => taskEither.fromIO(authStateRef.read))
          )
        ),
        taskEither.map(option.isSome)
      ),
    toResult: either.right(true),
  }),

  defineTest({
    name: `returns singed out state after client.auth.createUserAndSignInWithEmailAndPassword then client.auth.signOut then subscribe`,
    expect: ({ client }) =>
      pipe(
        taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
        taskEither.chainW((authStateRef) =>
          pipe(
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            }),
            taskEither.chainW(() => client.auth.signOut),
            taskEither.chainW(() =>
              taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write))
            ),
            taskEither.chainW(() => taskEither.fromIO(authStateRef.read))
          )
        )
      ),
    toResult: either.right(option.none),
  }),

  defineTest({
    name: `returns singed out state after subscribe and client.auth.createUserAndSignInWithEmailAndPassword then client.auth.signOut`,
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
            taskEither.chainW(() => client.auth.signOut),
            taskEither.chainW(() => taskEither.fromIO(authStateRef.read))
          )
        )
      ),
    toResult: either.right(option.none),
  }),

  defineTest({
    name: `returns singed out state after client.auth.createUserAndSignInWithEmailAndPassword then subscribe then client.auth.signOut`,
    expect: ({ client }) =>
      pipe(
        taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
        taskEither.chainW((authStateRef) =>
          pipe(
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            }),
            taskEither.chainW(() =>
              taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write))
            ),
            taskEither.chainW(() => client.auth.signOut),
            taskEither.chainW(() => taskEither.fromIO(authStateRef.read))
          )
        )
      ),
    toResult: either.right(option.none),
  }),

  defineTest({
    name: 'does not call onAuthStateChanged callback after unsubscribed',
    expect: ({ client }) =>
      pipe(
        taskEither.fromIO(ioRef.newIORef<AuthState>(option.none)),
        taskEither.chainW((authStateRef) =>
          pipe(
            taskEither.fromIO(client.auth.onAuthStateChanged(authStateRef.write)),
            taskEither.chainW((unsubscribe) => taskEither.fromIO(unsubscribe)),
            taskEither.chainW(() =>
              client.auth.createUserAndSignInWithEmailAndPassword({
                email: 'kira@sakurazaka.com',
                password: 'dorokatsu',
              })
            ),
            taskEither.chainW(() => taskEither.fromIO(authStateRef.read))
          )
        )
      ),
    toResult: either.right(option.none),
  }),
];
