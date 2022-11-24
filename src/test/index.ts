import { apply, either, io, option, reader, task, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';
import { Window } from 'happy-dom';
import fetch from 'node-fetch';
import { describe, expect, test } from 'vitest';

import { MkStack } from '../type';

const readerS = apply.sequenceS(reader.Apply);

export const tests = <ClientEnv>(mkStackFromEnv: MkStack<ClientEnv>, clientEnv: ClientEnv) => {
  const mkStack = pipe(
    io.Do,
    io.bind('stack', () => mkStackFromEnv),
    io.bind('window', () => () => new Window()),
    io.map(({ stack, window }) =>
      pipe(
        { browser: { window: () => window as any }, client: clientEnv },
        readerS({
          auth: readerS(stack.client.auth),
          db: readerS(stack.client.db),
          storage: readerS(stack.client.storage),
        }),
        (client) => ({ ...stack, client })
      )
    ),
    task.fromIO
  );

  describe('storage is independent between tests', () => {
    test('a server can upload file kira', async () => {
      const result = pipe(
        task.Do,
        task.bind('stack', () => mkStack),
        task.chainFirst(({ stack }) =>
          stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })
        ),
        task.chainFirst(({ stack }) =>
          stack.client.storage.uploadDataUrl({
            key: 'kira_key',
            file: 'data:;base64,a2lyYSBtYXN1bW90bw==',
          })
        ),
        task.chain(({ stack }) => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
        task.map(either.isRight)
      );
      expect(await result()).toEqual(true);
    });

    test('server from another test can not access file kira', async () => {
      const result = pipe(
        task.Do,
        task.bind('stack', () => mkStack),
        task.chainFirst(({ stack }) =>
          stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })
        ),
        task.chain(({ stack }) => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
        taskEither.mapLeft(({ code }) => code)
      );
      expect(await result()).toEqual(either.left('FileNotFound'));
    });
  });

  describe('db is independent between tests', () => {
    test('a server can create document kira', async () => {
      const result = pipe(
        task.Do,
        task.bind('stack', () => mkStack),
        task.chainFirst(({ stack }) => stack.ci.deployDb({ securityRule: { type: 'allowAll' } })),
        task.chainFirst(({ stack }) =>
          stack.client.db.setDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        ),
        task.chain(({ stack }) =>
          stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } })
        )
      );
      expect(await result()).toEqual(either.right(option.some({ name: 'masumoto' })));
    });

    test('server from another test can not access document kira', async () => {
      const result = pipe(
        task.Do,
        task.bind('stack', () => mkStack),
        task.chainFirst(({ stack }) => stack.ci.deployDb({ securityRule: { type: 'allowAll' } })),
        task.chain(({ stack }) =>
          stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } })
        )
      );
      expect(await result()).toEqual(either.right(option.none));
    });
  });

  test('can upload data url and get download url', async () => {
    const result = pipe(
      task.Do,
      task.bind('stack', () => mkStack),
      task.chainFirst(({ stack }) =>
        stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })
      ),
      task.chainFirst(({ stack }) =>
        stack.client.storage.uploadDataUrl({
          file: 'data:;base64,a2lyYSBtYXN1bW90bw==',
          key: 'masumo',
        })
      ),
      task.chain(({ stack }) => stack.client.storage.getDownloadUrl({ key: 'masumo' })),
      taskEither.chain((downloadUrl) => taskEither.tryCatch(() => fetch(downloadUrl), identity)),
      taskEither.chain((res) => taskEither.tryCatch(() => res.text(), identity))
    );

    expect(await result()).toEqual(either.right('kira masumoto'));
  });
};
