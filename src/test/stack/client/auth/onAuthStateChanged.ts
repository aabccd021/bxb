import { either, ioRef, option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { DeepPick } from 'ts-essentials/dist/types';

import type { AuthState, Stack } from '../../../..';
import { defineTest } from '../../../util';

export const test0001 = defineTest({
  name: 'returns signed out as default auth state',
  expect: ({
    client,
  }: DeepPick<
    Stack.Type,
    { readonly client: { readonly auth: { readonly onAuthStateChanged: never } } }
  >) =>
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

export const test0002 = defineTest({
  name: 'returns singed in state after client.auth.createUserAndSignInWithEmailAndPassword',
  expect: ({
    client,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: {
        readonly auth: {
          readonly createUserAndSignInWithEmailAndPassword: never;
          readonly onAuthStateChanged: never;
        };
      };
    }
  >) =>
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

export const test0003 = defineTest({
  name: `returns singed out state after client.auth.createUserAndSignInWithEmailAndPassword then client.auth.signOut then subscribe`,
  expect: ({
    client,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: {
        readonly auth: {
          readonly createUserAndSignInWithEmailAndPassword: never;
          readonly onAuthStateChanged: never;
          readonly signOut: never;
        };
      };
    }
  >) =>
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

export const test0004 = defineTest({
  name: `returns singed out state after subscribe and client.auth.createUserAndSignInWithEmailAndPassword then client.auth.signOut`,
  expect: ({
    client,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: {
        readonly auth: {
          readonly createUserAndSignInWithEmailAndPassword: never;
          readonly onAuthStateChanged: never;
          readonly signOut: never;
        };
      };
    }
  >) =>
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

export const test0005 = defineTest({
  name: `returns singed out state after client.auth.createUserAndSignInWithEmailAndPassword then subscribe then client.auth.signOut`,
  expect: ({
    client,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: {
        readonly auth: {
          readonly createUserAndSignInWithEmailAndPassword: never;
          readonly onAuthStateChanged: never;
          readonly signOut: never;
        };
      };
    }
  >) =>
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

export const test0006 = defineTest({
  name: 'does not call onAuthStateChanged callback after unsubscribed',
  expect: ({
    client,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: {
        readonly auth: {
          readonly createUserAndSignInWithEmailAndPassword: never;
          readonly onAuthStateChanged: never;
        };
      };
    }
  >) =>
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
