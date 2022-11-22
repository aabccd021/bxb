import { apply, either as E, io, reader, task as T } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { Window } from 'happy-dom';
import { describe, expect, test } from 'vitest';

import { GetDocError, GetDownloadUrlError, MkStack } from '../type';

const readerS = apply.sequenceS(reader.Apply);

const adaptMkStack = <ClientEnv>(mkMkStack: MkStack<ClientEnv>, clientEnv: ClientEnv) =>
  pipe(
    io.Do,
    io.bind('stack', () => mkMkStack),
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
    T.fromIO
  );

export const independencyTests = <ClientEnv>(
  mkMkStack: MkStack<ClientEnv>,
  clientEnv: ClientEnv
) => {
  const mkStack = adaptMkStack(mkMkStack, clientEnv);

  describe('storage is independent between tests', () => {
    test('a server can upload file kira', async () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => mkStack),
        T.chainFirst(({ stack }) => stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })),
        T.chainFirst(({ stack }) =>
          stack.client.storage.uploadBase64({
            key: 'kira_key',
            file: 'kira_content',
          })
        ),
        T.chain(({ stack }) => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
        T.map(E.isRight)
      );
      expect(await result()).toEqual(true);
    });

    test('server from another test can not access file kira', async () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => mkStack),
        T.chainFirst(({ stack }) => stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })),
        T.chain(({ stack }) => stack.client.storage.getDownloadUrl({ key: 'kira_key' }))
      );
      expect(await result()).toEqual(E.left(GetDownloadUrlError.Union.as.FileNotFound({})));
    });
  });

  describe.skip('db is independent between tests', () => {
    test('a server can create document kira', async () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => mkStack),
        T.chainFirst(({ stack }) => stack.ci.deployDb({ securityRule: { type: 'allowAll' } })),
        T.chainFirst(({ stack }) =>
          stack.client.db.setDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        ),
        T.chain(({ stack }) =>
          stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } })
        )
      );
      expect(await result()).toEqual(E.right({ name: 'masumoto' }));
    });

    test('server from another test can not access document kira', async () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => mkStack),
        T.chainFirst(({ stack }) => stack.ci.deployDb({ securityRule: { type: 'allowAll' } })),
        T.chain(({ stack }) =>
          stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } })
        )
      );
      expect(await result()).toEqual(E.left(GetDocError.Union.as.DocNotFound({})));
    });
  });
};
