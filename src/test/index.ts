import { apply, either, option, reader, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { TaskEither } from 'fp-ts/TaskEither';
import { describe, expect, test as test_ } from 'vitest';

import type { StackType, StackWithEnv } from '../type';
import * as functions from './functions';
import * as stackTests from './stack';
import type { Test } from './util';

const readerS = apply.sequenceS(reader.Apply);

const mkTest =
  <T extends StackType>(stack: StackWithEnv<T>, getTestEnv: TaskEither<unknown, T['env']>) =>
  ({ name, expect: fn, toResult, type }: Test<unknown>) =>
    (type === 'fail' ? test_.fails : test_)(name, async () => {
      const result = pipe(
        getTestEnv,
        taskEither.map(({ client, ci, server }) => ({
          client: readerS({
            auth: readerS(stack.client.auth),
            db: readerS(stack.client.db),
            storage: readerS(stack.client.storage),
          })(client),
          ci: readerS(stack.ci)(ci),
          server: readerS({
            db: readerS(stack.server.db),
          })(server),
        })),
        taskEither.chainW(fn)
      );
      expect(await result()).toEqual(toResult);
    });

export const runTests = <T extends StackType>(
  realStack: StackWithEnv<T>,
  getTestEnv: TaskEither<unknown, T['env']>
) => {
  const runTest = mkTest(realStack, getTestEnv);

  describe('storage is independent between tests', () => {
    runTest({
      name: 'a server can upload file kira',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployStorage({ securityRule: { type: 'allowAll' } }),
          taskEither.chainW(() =>
            client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: 'data:,foo' })
          ),
          taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
          taskEither.chainW(() => taskEither.right('download success'))
        ),
      toResult: either.right('download success'),
    });

    runTest({
      name: 'server from another test can not access file kira',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployStorage({ securityRule: { type: 'allowAll' } }),
          taskEither.chainW(() => client.storage.getDownloadUrl({ key: 'kira_key' })),
          taskEither.chainW(() => taskEither.right('download success'))
        ),
      toResult: either.left({ code: 'FileNotFound', capability: 'client.storage.getDownloadUrl' }),
    });
  });

  describe('db is independent between tests', () => {
    runTest({
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
          taskEither.chainW(() =>
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.some({ name: 'masumoto' })),
    });

    runTest({
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
          taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.none),
    });
  });

  describe('db is independent between tests using server API', () => {
    runTest({
      name: 'a server can create document kira',
      expect: ({ server, ci }) =>
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
          taskEither.chainW(() =>
            server.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(() => server.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.some({ name: 'masumoto' })),
    });

    runTest({
      name: 'another test can not access document kira using server API',
      expect: ({ server, ci }) =>
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
          taskEither.chainW(() => server.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        ),
      toResult: either.right(option.none),
    });
  });

  describe('user is independent between test', () => {
    runTest({
      name: 'a test can create user kira for the first time and return error for the second time',
      expect: ({ client }) =>
        pipe(
          client.auth.createUserAndSignInWithEmailAndPassword({
            email: 'kira@sakurazaka.com',
            password: 'dorokatsu',
          }),
          taskEither.chainW(() =>
            client.auth.createUserAndSignInWithEmailAndPassword({
              email: 'kira@sakurazaka.com',
              password: 'dorokatsu',
            })
          ),
          taskEither.chainW(() => taskEither.right('create user kira two times success'))
        ),
      toResult: either.left({
        code: 'EmailAlreadyInUse',
        capability: 'client.auth.createUserAndSignInWithEmailAndPassword',
      }),
    });

    runTest({
      name: 'another test can create the same user',
      expect: ({ client }) =>
        pipe(
          client.auth.createUserAndSignInWithEmailAndPassword({
            email: 'kira@sakurazaka.com',
            password: 'dorokatsu',
          }),
          taskEither.chainW(() => taskEither.right('create user kira success'))
        ),
      toResult: either.right('create user kira success'),
    });
  });

  describe('sign in state is independent between test', () => {
    runTest({
      name: 'a test can sign in and change state to signed in',
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

    runTest({
      name: 'another test should initially signed out',
      expect: ({ client }) => client.auth.getAuthState,
      toResult: either.right(option.none),
    });
  });

  describe('functions is independent between test', () => {
    runTest(functions.independencyTest1);
    runTest(functions.independencyTest2);
  });

  runTest(functions.test2);
  runTest(functions.test3);
  runTest(functions.test4);

  describe('server.db.upsertDoc', () => {
    stackTests.server.db.upsertDoc.tests.forEach(runTest);
  });
  describe('server.db.getDoc', () => {
    stackTests.server.db.getDoc.tests.forEach(runTest);
  });

  describe('client.db.upsertDoc', () => {
    stackTests.client.db.upsertDoc.tests.forEach(runTest);
  });
  describe('client.db.getDoc', () => {
    stackTests.client.db.getDoc.tests.forEach(runTest);
  });
  describe('client.db.onSnapshot', () => {
    stackTests.client.db.onSnapshot.tests.forEach(runTest);
  });
  describe('client.auth.getAuthState', () => {
    stackTests.client.auth.getAuthState.tests.forEach(runTest);
  });
  describe('client.auth.onAuthStateChanged', () => {
    stackTests.client.auth.onAuthStateChanged.tests.forEach(runTest);
  });
  describe('client.auth.createUserAndSignInWithEmailAndPassword', () => {
    stackTests.client.auth.createUserAndSignInWithEmailAndPassword.tests.forEach(runTest);
  });

  describe('client.storage.uploadDataUrl', () => {
    stackTests.client.storage.uploadDataUrl.tests.forEach(runTest);
  });
  describe('client.storage.getDownloadUrl', () => {
    stackTests.client.storage.getDownloadUrl.tests.forEach(runTest);
  });
};
