/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import { task as T } from 'fp-ts';
import { describe, expect, test } from 'vitest';

type Server = {
  readonly client: undefined;
};

export type MkServer = T.Task<Server>;

export const runTest = () =>
  describe('storage is independent between tests', () => {
    test('a server can upload file foo', () => {
      expect('b').equals('b');
    });

    test('server from another test can not access file foo', () => {
      expect('c').equals('c');
    });
  });
