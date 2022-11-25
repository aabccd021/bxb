import { apply, either, io, option, reader, task, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import { Window } from 'happy-dom';
import fetch from 'node-fetch';
import { describe, expect, test } from 'vitest';

import type { Stack } from '../type';
import { DataUrl } from '../type';

const readerS = apply.sequenceS(reader.Apply);

const applyStackEnv = <ClientEnv, ClientConfig>(
  envStack: Stack<ClientEnv, ClientConfig>,
  mkClientEnv: IO<ClientEnv>,
  config: ClientConfig
) =>
  pipe(
    io.Do,
    io.bind('clientEnv', () => mkClientEnv),
    io.bind('window', () => () => new Window()),
    io.map(({ clientEnv, window }) =>
      pipe(
        // eslint-disable-next-line max-len
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
        { browser: { window: () => window as any }, provider: clientEnv, config },
        readerS({
          auth: readerS(envStack.client.auth),
          db: readerS(envStack.client.db),
          storage: readerS(envStack.client.storage),
        }),
        (client) => ({ ...envStack, client })
      )
    ),
    task.fromIO
  );

export const tests = <ClientEnv, ClientConfig>(
  realStack: Stack<ClientEnv, ClientConfig>,
  mkClientTestEnv: IO<ClientEnv>,
  config: ClientConfig
) => {
  const mkStack = applyStackEnv(realStack, mkClientTestEnv, config);

  describe('storage is independent between tests', () => {
    test('a server can upload file kira', async () => {
      const result = pipe(
        mkStack,
        task.chainFirst((stack) => stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })),
        task.chain((stack) =>
          pipe(
            'data:;base64,a2lyYSBtYXN1bW90bw==',
            DataUrl.type.decode,
            either.map((dataUrl) => ({ key: 'kira_key', dataUrl })),
            taskEither.fromEither,
            taskEither.chainW(stack.client.storage.uploadDataUrl),
            taskEither.chainW(() => stack.client.storage.getDownloadUrl({ key: 'kira_key' }))
          )
        ),
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
      mkStack,
      task.chainFirst((stack) => stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })),
      task.chain((stack) =>
        pipe(
          'data:;base64,a2lyYSBtYXN1bW90bw==',
          DataUrl.type.decode,
          either.map((dataUrl) => ({ key: 'kira_key', dataUrl })),
          taskEither.fromEither,
          taskEither.chainW(stack.client.storage.uploadDataUrl),
          taskEither.chainW(() => stack.client.storage.getDownloadUrl({ key: 'kira_key' }))
        )
      ),
      taskEither.chain((downloadUrl) => taskEither.tryCatch(() => fetch(downloadUrl), identity)),
      taskEither.chain((res) => taskEither.tryCatch(() => res.text(), identity))
    );
    expect(await result()).toEqual(either.right('kira masumoto'));
  });
};
