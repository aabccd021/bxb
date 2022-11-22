import { either as E, io, task as T } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { Window } from 'happy-dom';
import { describe, expect, test } from 'vitest';

import { GetDocError, GetDownloadUrlError, MkStack } from '../type';
export const independencyTests = <ClientEnv>(
  mkMkStack: MkStack<ClientEnv>,
  clientEnv: ClientEnv
) => {
  const mkStack = pipe(
    mkMkStack,
    io.map((stack) => {
      const env = { browser: { window: () => new Window() as any }, client: clientEnv };
      return {
        ...stack,
        client: {
          auth: {
            signInWithGoogleRedirect: stack.client.auth.signInWithGoogleRedirect(env),
            createUserAndSignInWithEmailAndPassword:
              stack.client.auth.createUserAndSignInWithEmailAndPassword(env),
            onAuthStateChanged: stack.client.auth.onAuthStateChanged(env),
            signOut: stack.client.auth.signOut(env),
          },
          db: {
            setDoc: stack.client.db.setDoc(env),
            getDoc: stack.client.db.getDoc(env),
          },
          storage: {
            uploadBase64: stack.client.storage.uploadBase64(env),
            getDownloadUrl: stack.client.storage.getDownloadUrl(env),
          },
        },
      };
    })
  );

  describe('storage is independent between tests', () => {
    test('a server can upload file kira', async () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => T.fromIO(mkStack)),
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
        T.bind('stack', () => T.fromIO(mkStack)),
        T.chainFirst(({ stack }) => stack.ci.deployStorage({ securityRule: { type: 'allowAll' } })),
        T.chain(({ stack }) => stack.client.storage.getDownloadUrl({ key: 'kira_key' }))
      );
      expect(await result()).toEqual(E.left(GetDownloadUrlError.Union.as.FileNotFound({})));
    });
  });

  describe('db is independent between tests', () => {
    test('a server can create document kira', async () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => T.fromIO(mkStack)),
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
        T.bind('stack', () => T.fromIO(mkStack)),
        T.chainFirst(({ stack }) => stack.ci.deployDb({ securityRule: { type: 'allowAll' } })),
        T.chain(({ stack }) =>
          stack.client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } })
        )
      );
      expect(await result()).toEqual(E.left(GetDocError.Union.as.DocNotFound({})));
    });
  });
};
