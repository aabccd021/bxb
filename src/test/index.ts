import { apply, either, io, ioRef, option, reader } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { flow, identity, pipe } from 'fp-ts/function';
import type { Option } from 'fp-ts/Option';
import type { TaskEither } from 'fp-ts/TaskEither';
// eslint-disable-next-line fp-ts/no-module-imports
import { chainW as then, fromIO, map, right, tryCatch } from 'fp-ts/TaskEither';
import fetch from 'node-fetch';
import { describe, expect, test as test_ } from 'vitest';

import type { NoEnvStack, Stack } from '../type';

const readerS = apply.sequenceS(reader.Apply);

const mkTest =
  <ClientEnv>(stack: Stack<ClientEnv>, getTestClientEnv: TaskEither<unknown, ClientEnv>) =>
  <T>({
    name,
    expect: fn,
    toResult,
  }: {
    readonly name: string;
    readonly expect: (stack: NoEnvStack) => TaskEither<unknown, T>;
    readonly toResult: Either<unknown, T>;
  }) =>
    test_(name, async () => {
      const result = pipe(
        getTestClientEnv,
        map(
          flow(
            readerS({
              auth: readerS(stack.client.auth),
              db: readerS(stack.client.db),
              storage: readerS(stack.client.storage),
            }),
            (client) => ({ ...stack, client })
          )
        ),
        then(fn)
      );
      expect(await result()).toEqual(toResult);
    });

const fetchText = (url: string) =>
  pipe(
    tryCatch(() => fetch(url), identity),
    then((downloadResult) => tryCatch(() => downloadResult.text(), identity))
  );

export const runTests = <ClientEnv>(
  realStack: Stack<ClientEnv>,
  getTestClientEnv: TaskEither<unknown, ClientEnv>
) => {
  const test = mkTest(realStack, getTestClientEnv);

  describe('storage is independent between tests', () => {
    test({
      name: 'a server can upload file kira',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployStorage({ securityRule: { type: 'allowAll' } }),
          then(() => client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: 'data:,foo' })),
          then(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
          then(() => right('download success'))
        ),
      toResult: either.right('download success'),
    });

    test({
      name: 'server from another test can not access file kira',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployStorage({ securityRule: { type: 'allowAll' } }),
          then(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
          then(() => right('download success'))
        ),
      toResult: either.left({ code: 'FileNotFound' }),
    });
  });

  describe('db is independent between tests', () => {
    test({
      name: 'a server can create document kira',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({ securityRule: { type: 'allowAll' } }),
          then(() =>
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          then(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.some({ name: 'masumoto' })),
    });

    test({
      name: 'server from another test can not access document kira',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({ securityRule: { type: 'allowAll' } }),
          then(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.none),
    });
  });

  describe('user is independent between test', () => {
    test({
      name: 'a test can create user kira for the first time and return error for the second time',
      expect: ({ client }) =>
        pipe(
          client.auth.createUserAndSignInWithEmailAndPassword({
            email: 'kira@sakurazaka.com',
            password: 'dorokatsu',
          }),
          then(() =>
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            })
          ),
          then(() => right('create user kira two times success'))
        ),
      toResult: either.left({ code: 'EmailAlreadyInUse' }),
    });

    test({
      name: 'another test can create the same user',
      expect: ({ client }) =>
        pipe(
          client.auth.createUserAndSignInWithEmailAndPassword({
            email: 'kira@sakurazaka.com',
            password: 'dorokatsu',
          }),
          then(() => right('create user kira success'))
        ),
      toResult: either.right('create user kira success'),
    });
  });

  test({
    name: 'can upload data url and get download url',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployStorage({ securityRule: { type: 'allowAll' } }),
        then(() =>
          client.storage.uploadDataUrl({
            key: 'kira_key',
            dataUrl: `data:;base64,${Buffer.from('kira masumoto').toString('base64')}`,
          })
        ),
        then(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
        then(fetchText)
      ),
    toResult: either.right('kira masumoto'),
  });

  test({
    name: 'return left on invalid dataUrl upload',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployStorage({ securityRule: { type: 'allowAll' } }),
        then(() => client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: 'invalidDataUrl' }))
      ),
    toResult: either.left({ code: 'InvalidDataUrlFormat' }),
  });

  test({
    name: 'initial auth state is signed out',
    expect: ({ client }) =>
      pipe(
        ioRef.newIORef<Option<string>>(option.none),
        io.chain((authStateRef) =>
          pipe(
            client.auth.onAuthStateChanged(authStateRef.write),
            io.chain(() => authStateRef.read)
          )
        ),
        fromIO
      ),
    toResult: either.right(option.none),
  });

  test({
    name: 'auth state changes to signed in after sign in',
    expect: ({ client }) =>
      pipe(
        fromIO(ioRef.newIORef<Option<string>>(option.none)),
        then((authStateRef) =>
          pipe(
            fromIO(client.auth.onAuthStateChanged(authStateRef.write)),
            then(() =>
              client.auth.createUserAndSignInWithEmailAndPassword({
                email: 'kira@sakurazaka.com',
                password: 'dorokatsu',
              })
            ),
            then(() => fromIO(authStateRef.read))
          )
        ),
        map(option.isSome)
      ),
    toResult: either.right(true),
  });

  test({
    name: 'auth state changes to signed out after sign in and then sign out',
    expect: ({ client }) =>
      pipe(
        fromIO(ioRef.newIORef<Option<string>>(option.none)),
        then((authStateRef) =>
          pipe(
            fromIO(client.auth.onAuthStateChanged(authStateRef.write)),
            then(() =>
              client.auth.createUserAndSignInWithEmailAndPassword({
                email: 'kira@sakurazaka.com',
                password: 'dorokatsu',
              })
            ),
            then(() => client.auth.signOut),
            then(() => fromIO(authStateRef.read))
          )
        )
      ),
    toResult: either.right(option.none),
  });

  test({
    name: 'auth state does not change after unsubscribed',
    expect: ({ client }) =>
      pipe(
        fromIO(ioRef.newIORef<Option<string>>(option.none)),
        then((authStateRef) =>
          pipe(
            fromIO(client.auth.onAuthStateChanged(authStateRef.write)),
            then((unsubscribe) => fromIO(unsubscribe)),
            then(() =>
              client.auth.createUserAndSignInWithEmailAndPassword({
                email: 'kira@sakurazaka.com',
                password: 'dorokatsu',
              })
            ),
            then(() => fromIO(authStateRef.read))
          )
        )
      ),
    toResult: either.right(option.none),
  });
};
