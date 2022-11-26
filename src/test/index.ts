import { apply, either as E, io, option as O, reader, task as T, taskEither as TE } from 'fp-ts';
import { flow, identity, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import fetch from 'node-fetch';
import { describe, expect, test } from 'vitest';

import type { NoEnvStack, Stack } from '../type';

const readerS = apply.sequenceS(reader.Apply);

const applyStackEnv =
  <ClientEnv>(stack: Stack<ClientEnv>, getTestClientEnv: IO<ClientEnv>) =>
  <T>(f: (stack: NoEnvStack) => Task<T>) =>
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
      T.fromIO,
      T.chain(f)
    );

export const tests = <ClientEnv>(realStack: Stack<ClientEnv>, getTestClientEnv: IO<ClientEnv>) => {
  const runWithStack = applyStackEnv(realStack, getTestClientEnv);

  describe('storage is independent between tests', () => {
    test('a server can upload file kira', async () => {
      const result = runWithStack((stack) =>
        pipe(
          stack.ci.deployStorage({ securityRule: { type: 'allowAll' } }),
          TE.chainW(() =>
            stack.client.storage.uploadDataUrl({
              key: 'kira_key',
              dataUrl: 'data:;base64,a2lyYSBtYXN1bW90bw==',
            })
          ),
          TE.chainW(() => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
          T.map(E.isRight)
        )
      );
      expect(await result()).toEqual(true);
    });

    test('server from another test can not access file kira', async () => {
      const result = runWithStack((stack) =>
        pipe(
          stack.ci.deployStorage({ securityRule: { type: 'allowAll' } }),
          TE.chainW(() => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
          TE.mapLeft(({ code }) => code)
        )
      );
      expect(await result()).toEqual(E.left('FileNotFound'));
    });
  });

  describe('db is independent between tests', () => {
    test('a server can create document kira', async () => {
      const result = runWithStack((stack) =>
        pipe(
          stack.ci.deployDb({ securityRule: { type: 'allowAll' } }),
          TE.chain(() =>
            stack.client.db.setDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          TE.chainW(() => stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        )
      );
      expect(await result()).toEqual(E.right(O.some({ name: 'masumoto' })));
    });

    test('server from another test can not access document kira', async () => {
      const result = runWithStack((stack) =>
        pipe(
          stack.ci.deployDb({ securityRule: { type: 'allowAll' } }),
          TE.chainW(() => stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
        )
      );
      expect(await result()).toEqual(E.right(O.none));
    });
  });

  test('can upload data url and get download url', async () => {
    const result = runWithStack((stack) =>
      pipe(
        stack.ci.deployStorage({ securityRule: { type: 'allowAll' } }),
        TE.chainW(() =>
          stack.client.storage.uploadDataUrl({
            key: 'kira_key',
            dataUrl: 'data:;base64,a2lyYSBtYXN1bW90bw==',
          })
        ),
        TE.chainW(() => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
        TE.chain((downloadUrl) => TE.tryCatch(() => fetch(downloadUrl), identity)),
        TE.chain((res) => TE.tryCatch(() => res.text(), identity))
      )
    );
    expect(await result()).toEqual(E.right('kira masumoto'));
  });

  test('return left on invalid dataUrl upload', async () => {
    const result = runWithStack((stack) =>
      pipe(
        stack.ci.deployStorage({ securityRule: { type: 'allowAll' } }),
        TE.chainW(() =>
          stack.client.storage.uploadDataUrl({ key: 'kira_key', dataUrl: 'invalidDataUrl' })
        ),
        TE.mapLeft(({ code }) => code)
      )
    );
    expect(await result()).toEqual(E.left('InvalidDataUrlFormat'));
  });
};
