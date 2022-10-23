/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import { either as E, task as T } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { Task } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';
import { describe, expect, test } from 'vitest';

type GetDownloadUrlError = {
  readonly code: 'not-found';
};

type DeployConfig = {
  readonly storage?: {
    readonly securityRule?: {
      readonly type?: 'allowAll';
    };
  };
};

type Stack = {
  readonly admin: {
    readonly deploy: (c: DeployConfig) => Task<void>;
  };
  readonly client: {
    readonly storage: {
      readonly upload: (p: {
        readonly key: string;
        readonly file: string;
        readonly format: 'base64';
      }) => Task<void>;
      readonly getDownloadUrl: (key: string) => TaskEither<GetDownloadUrlError, string>;
    };
  };
};

export type MkStack = Task<Stack>;

export const runTests = (mkStack: MkStack) =>
  describe('storage is independent between tests', () => {
    test('a server can upload file kira', () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => mkStack),
        T.chainFirst(({ stack }) =>
          stack.admin.deploy({ storage: { securityRule: { type: 'allowAll' } } })
        ),
        T.chainFirst(({ stack }) =>
          stack.client.storage.upload({ key: 'kira_key', file: 'kira_content', format: 'base64' })
        ),
        T.chain(({ stack }) => stack.client.storage.getDownloadUrl('kira_key')),
        T.map(E.isRight)
      );
      expect(result()).resolves.toEqual(true);
    });

    test('server from another test can not access file kira', () => {
      const result = pipe(
        T.Do,
        T.bind('stack', () => mkStack),
        T.chainFirst(({ stack }) =>
          stack.admin.deploy({ storage: { securityRule: { type: 'allowAll' } } })
        ),
        T.chain(({ stack }) => stack.client.storage.getDownloadUrl('kira_key'))
      );
      expect(result()).resolves.toEqual(E.right({ code: 'not-found' }));
    });
  });
