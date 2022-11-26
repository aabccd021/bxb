import { apply, either, io, option, reader, task, taskEither } from 'fp-ts';
import { flow, identity, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import fetch from 'node-fetch';
import { describe, expect, test } from 'vitest';

import type { Stack } from '../type';

const readerS = apply.sequenceS(reader.Apply);

const applyStackEnv = <ClientEnv>(stack: Stack<ClientEnv>, getTestClientEnv: IO<ClientEnv>) =>
  pipe(
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
    taskEither.fromIO
  );

export const tests = <ClientEnv>(realStack: Stack<ClientEnv>, getTestClientEnv: IO<ClientEnv>) => {
  const mkStack = applyStackEnv(realStack, getTestClientEnv);

  describe('storage is independent between tests', () => {
    test('a server can upload file kira', async () => {
      const result = pipe(
        mkStack,
        taskEither.chainFirstTaskK((stack) =>
          stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })
        ),
        taskEither.chain((stack) =>
          pipe(
            stack.client.storage.uploadDataUrl({
              key: 'kira_key',
              dataUrl: 'data:;base64,a2lyYSBtYXN1bW90bw==',
            }),
            taskEither.chainW(() => stack.client.storage.getDownloadUrl({ key: 'kira_key' }))
          )
        ),
        task.map(either.isRight)
      );
      expect(await result()).toEqual(true);
    });

    test('server from another test can not access file kira', async () => {
      const result = pipe(
        mkStack,
        taskEither.chainFirstTaskK((stack) =>
          stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })
        ),
        taskEither.chain((stack) => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
        taskEither.mapLeft(({ code }) => code)
      );
      expect(await result()).toEqual(either.left('FileNotFound'));
    });
  });

  describe('db is independent between tests', () => {
    test('a server can create document kira', async () => {
      const result = pipe(
        mkStack,
        taskEither.chainFirstTaskK((stack) =>
          stack.ci.deployDb({ securityRule: { type: 'allowAll' } })
        ),
        taskEither.chain((stack) =>
          pipe(
            stack.client.db.setDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            }),
            taskEither.chainW(() =>
              stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } })
            )
          )
        )
      );
      expect(await result()).toEqual(either.right(option.some({ name: 'masumoto' })));
    });

    test('server from another test can not access document kira', async () => {
      const result = pipe(
        mkStack,
        taskEither.chainFirstTaskK((stack) =>
          stack.ci.deployDb({ securityRule: { type: 'allowAll' } })
        ),
        taskEither.chainW((stack) =>
          stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } })
        )
      );
      expect(await result()).toEqual(either.right(option.none));
    });
  });

  test('can upload data url and get download url', async () => {
    const result = pipe(
      mkStack,
      taskEither.chainFirstTaskK((stack) =>
        stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })
      ),
      taskEither.chain((stack) =>
        pipe(
          stack.client.storage.uploadDataUrl({
            key: 'kira_key',
            dataUrl: 'data:;base64,a2lyYSBtYXN1bW90bw==',
          }),
          taskEither.chainW(() => stack.client.storage.getDownloadUrl({ key: 'kira_key' }))
        )
      ),
      taskEither.chain((downloadUrl) => taskEither.tryCatch(() => fetch(downloadUrl), identity)),
      taskEither.chain((res) => taskEither.tryCatch(() => res.text(), identity))
    );
    expect(await result()).toEqual(either.right('kira masumoto'));
  });

  test('return left on invalid dataUrl upload', async () => {
    const result = pipe(
      mkStack,
      taskEither.chainFirstTaskK((stack) =>
        stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })
      ),
      taskEither.chain((stack) =>
        stack.client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: 'invalidDataUrl' })
      ),
      taskEither.mapLeft(({ code }) => code)
    );
    expect(await result()).toEqual(either.left('InvalidDataUrlFormat'));
  });
};
