import { apply, either, io, ioRef, option, reader } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { identity, pipe } from 'fp-ts/function';
import type { TaskEither } from 'fp-ts/TaskEither';
// eslint-disable-next-line fp-ts/no-module-imports
import { chainW as then, fromIO, map, right, tryCatch } from 'fp-ts/TaskEither';
import fetch from 'node-fetch';
import { describe, expect, test as test_ } from 'vitest';

import type { AuthState, Stack, StackWithEnv } from '../type';

const readerS = apply.sequenceS(reader.Apply);

const mkTest =
  <ClientEnv>(stack: StackWithEnv<ClientEnv>, getTestClientEnv: TaskEither<unknown, ClientEnv>) =>
  <T>({
    name,
    expect: fn,
    toResult,
  }: {
    readonly name: string;
    readonly expect: (stack: Stack.Type) => TaskEither<unknown, T>;
    readonly toResult: Either<unknown, T>;
  }) =>
    test_(name, async () => {
      const result = pipe(
        getTestClientEnv,
        map(
          readerS({
            client: readerS({
              auth: readerS(stack.client.auth),
              db: readerS(stack.client.db),
              storage: readerS(stack.client.storage),
            }),
            ci: readerS(stack.ci),
          })
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
  realStack: StackWithEnv<ClientEnv>,
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
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: {
                create: { type: 'True' },
                get: { type: 'True' },
              },
            },
          }),
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
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: {
                create: { type: 'True' },
                get: { type: 'True' },
              },
            },
          }),
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
        ioRef.newIORef<AuthState>(option.none),
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
        fromIO(ioRef.newIORef<AuthState>(option.none)),
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
    name: 'auth state changes to signed in after sign in when subscribed',
    expect: ({ client }) =>
      pipe(
        fromIO(ioRef.newIORef<AuthState>(option.none)),
        then((authStateRef) =>
          pipe(
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            }),
            then(() => fromIO(client.auth.onAuthStateChanged(authStateRef.write))),
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
        fromIO(ioRef.newIORef<AuthState>(option.none)),
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
    name: 'auth state changes to signed out after sign in and then sign out and subscribe',
    expect: ({ client }) =>
      pipe(
        fromIO(ioRef.newIORef<AuthState>(option.none)),
        then((authStateRef) =>
          pipe(
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            }),
            then(() => client.auth.signOut),
            then(() => fromIO(client.auth.onAuthStateChanged(authStateRef.write))),
            then(() => fromIO(authStateRef.read))
          )
        )
      ),
    toResult: either.right(option.none),
  });

  test({
    name: `auth state changes to signed out after sign in and then sign out when subscribed in between`,
    expect: ({ client }) =>
      pipe(
        fromIO(ioRef.newIORef<AuthState>(option.none)),
        then((authStateRef) =>
          pipe(
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            }),
            then(() => fromIO(client.auth.onAuthStateChanged(authStateRef.write))),
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
        fromIO(ioRef.newIORef<AuthState>(option.none)),
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

  test({
    name: 'can upsert and get doc',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              create: { type: 'True' },
              get: { type: 'True' },
            },
          },
        }),
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
    name: 'can not get doc if not allowed',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              create: { type: 'True' },
            },
          },
        }),
        then(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        ),
        then(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  });

  test({
    name: 'can upsert doc',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { create: { type: 'True' } },
          },
        }),
        then(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        ),
        then(() => right('upload success'))
      ),
    toResult: either.right('upload success'),
  });

  test({
    name: 'fail upsert doc if not explicitly allowed',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { get: { type: 'True' } },
          },
        }),
        then(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  });

  test({
    name: 'fail upsert doc if string given when int field required',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'IntField' } },
            securityRule: { get: { type: 'True' } },
          },
        }),
        then(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  });

  test({
    name: 'fail upsert doc if int given when string field required',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { get: { type: 'True' } },
          },
        }),
        then(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 46 },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  });

  test({
    name: 'fail upsert doc if schema not specified',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: {},
            securityRule: { get: { type: 'True' } },
          },
        }),
        then(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  });

  test({
    name: 'can not get doc if not allowed, even if the doc does not exists',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
          },
        }),
        then(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  });

  test({
    name: 'initial result of getAuthState is signed out',
    expect: ({ client }) => client.auth.getAuthState,
    toResult: either.right(option.none),
  });

  test({
    name: 'getAuthState returns signed in after sign in',
    expect: ({ client }) =>
      pipe(
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        }),
        then(() => client.auth.getAuthState),
        map(option.isSome)
      ),
    toResult: either.right(true),
  });

  test({
    name: 'getAuthState returns signed out after sign in and then sign out',
    expect: ({ client }) =>
      pipe(
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        }),
        then(() => client.auth.signOut),
        then(() => client.auth.getAuthState)
      ),
    toResult: either.right(option.none),
  });
};
