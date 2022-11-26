import { apply, either, io, option, reader, task, taskEither } from 'fp-ts';
import { flow, identity, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import fetch from 'node-fetch';
import { describe, expect, test as test_ } from 'vitest';

import type { NoEnvStack, Stack } from '../type';

const readerS = apply.sequenceS(reader.Apply);

const mkTest =
  <ClientEnv>(stack: Stack<ClientEnv>, getTestClientEnv: IO<ClientEnv>) =>
  <T>({
    name,
    expect: expectFn,
    toEqual: toResultEqual,
  }: {
    readonly name: string;
    readonly expect: (stack: NoEnvStack) => Task<T>;
    readonly toEqual: T;
  }) =>
    test_(name, async () => {
      const result = pipe(
        getTestClientEnv,
        io.map(
          flow(
            readerS({
              auth: readerS(stack.client.auth),
              db: readerS(stack.client.db),
              storage: readerS(stack.client.storage),
            }),
            (client) => ({ ...stack, client })
          )
        ),
        task.fromIO,
        task.chain(expectFn)
      );
      expect(await result()).toEqual(toResultEqual);
    });

export const tests = <ClientEnv>(realStack: Stack<ClientEnv>, getTestClientEnv: IO<ClientEnv>) => {
  const test = mkTest(realStack, getTestClientEnv);

  describe('storage is independent between tests', () => {
    test({
      name: 'a server can upload file kira',
      expect: (stack) =>
        pipe(
          stack.ci.deployStorage({ securityRule: { type: 'allowAll' } }),
          taskEither.chainW(() =>
            stack.client.storage.uploadDataUrl({
              key: 'kira_key',
              dataUrl: 'data:;base64,a2lyYSBtYXN1bW90bw==',
            })
          ),
          taskEither.chainW(() => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
          task.map(either.isRight)
        ),
      toEqual: true,
    });

    test({
      name: 'server from another test can not access file kira',
      expect: (stack) =>
        pipe(
          stack.ci.deployStorage({ securityRule: { type: 'allowAll' } }),
          taskEither.chainW(() => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
          taskEither.mapLeft(({ code }) => code)
        ),
      toEqual: either.left('FileNotFound'),
    });
  });

  describe('db is independent between tests', () => {
    test({
      name: 'a server can create document kira',
      expect: (stack) =>
        pipe(
          stack.ci.deployDb({ securityRule: { type: 'allowAll' } }),
          taskEither.chain(() =>
            stack.client.db.setDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(() =>
            stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } })
          )
        ),
      toEqual: either.right(option.some({ name: 'masumoto' })),
    });

    test({
      name: 'server from another test can not access document kira',
      expect: (stack) =>
        pipe(
          stack.ci.deployDb({ securityRule: { type: 'allowAll' } }),
          taskEither.chainW(() =>
            stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } })
          )
        ),
      toEqual: either.right(option.none),
    });
  });

  test({
    name: 'can upload data url and get download url',
    expect: (stack) =>
      pipe(
        stack.ci.deployStorage({ securityRule: { type: 'allowAll' } }),
        taskEither.chainW(() =>
          stack.client.storage.uploadDataUrl({
            key: 'kira_key',
            dataUrl: 'data:;base64,a2lyYSBtYXN1bW90bw==',
          })
        ),
        taskEither.chainW(() => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
        taskEither.chain((downloadUrl) => taskEither.tryCatch(() => fetch(downloadUrl), identity)),
        taskEither.chain((res) => taskEither.tryCatch(() => res.text(), identity))
      ),
    toEqual: either.right('kira masumoto'),
  });

  test({
    name: 'return left on invalid dataUrl upload',
    expect: (stack) =>
      pipe(
        stack.ci.deployStorage({ securityRule: { type: 'allowAll' } }),
        taskEither.chainW(() =>
          stack.client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: 'invalidDataUrl' })
        ),
        taskEither.mapLeft(({ code }) => code)
      ),
    toEqual: either.left('InvalidDataUrlFormat'),
  });
};
