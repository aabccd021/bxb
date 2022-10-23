import { either as E, task as T } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { describe, expect, test } from 'vitest';

import { MkStack } from '../type';

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
        T.chain(({ stack }) => stack.client.storage.getDownloadUrl({ key: 'kira_key' })),
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
        T.chain(({ stack }) => stack.client.storage.getDownloadUrl({ key: 'kira_key' }))
      );
      expect(result()).resolves.toEqual(E.right({ code: 'not-found' }));
    });
  });
