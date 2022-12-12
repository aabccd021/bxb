/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
import { option } from 'fp-ts';
import { either } from 'fp-ts';
import { taskEither } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import type { DocData } from '../../../../type';
import type { Suite } from '../../../util';
import { defineTest } from '../../../util';

export const suite: Suite = {
  name: 'client.db.onSnapshot',
  tests: [
    defineTest({
      name: 'can return a doc is created with client.db.upsertDoc',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: {
                create: { type: 'True' },
                get: { type: 'True' },
              },
            },
          }),
          taskEither.chainW(() =>
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainTaskK(
            () => () =>
              new Promise<DocData>((resolve) => {
                const unsub = client.db.onSnapshot({
                  key: { collection: 'user', id: 'kira_id' },
                  onChanged: (docState) => () => {
                    if (either.isRight(docState) && option.isSome(docState.right)) {
                      resolve(docState.right.value);
                      unsub();
                    }
                  },
                })();
              })
          )
        ),
      toResult: either.right({ name: 'masumoto' }),
    }),

    defineTest({
      name: 'can return a doc updated with client.db.upsertDoc',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: {
                create: { type: 'True' },
                update: { type: 'True' },
                get: { type: 'True' },
              },
            },
          }),
          taskEither.chainW(() =>
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(() =>
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'dorokatsu' },
            })
          ),
          taskEither.chainTaskK(
            () => () =>
              new Promise<DocData>((resolve) => {
                const unsub = client.db.onSnapshot({
                  key: { collection: 'user', id: 'kira_id' },
                  onChanged: (docState) => () => {
                    if (either.isRight(docState) && option.isSome(docState.right)) {
                      resolve(docState.right.value);
                      unsub();
                    }
                  },
                })();
              })
          )
        ),
      toResult: either.right({ name: 'dorokatsu' }),
    }),

    defineTest({
      name: 'returns ForbiddedError if forbidden',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: {
                create: { type: 'True' },
              },
            },
          }),
          taskEither.chainW(() =>
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(
            () => () =>
              new Promise<Either<unknown, unknown>>((resolve) => {
                const unsub = client.db.onSnapshot({
                  key: { collection: 'user', id: 'kira_id' },
                  onChanged: (docState) => () => {
                    if (either.isLeft(docState)) {
                      resolve(docState);
                      unsub();
                    }
                  },
                })();
              })
          )
        ),
      toResult: either.left({ code: 'ForbiddenError' }),
    }),

    defineTest({
      name: 'returns ForbiddenError if forbidden and document absent',
      expect: ({ client, ci }) =>
        pipe(
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
            },
          }),
          taskEither.chainW(
            () => () =>
              new Promise<Either<unknown, unknown>>((resolve) => {
                const unsub = client.db.onSnapshot({
                  key: { collection: 'user', id: 'kira_id' },
                  onChanged: (docState) => () => {
                    if (either.isLeft(docState)) {
                      resolve(docState);
                      unsub();
                    }
                  },
                })();
              })
          )
        ),
      toResult: either.left({ code: 'ForbiddenError' }),
    }),

    defineTest({
      name: 'can return a doc created with server.db.upsertDoc',
      expect: ({ client, ci, server }) =>
        pipe(
          ci.deployDb({
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: {
                get: { type: 'True' },
              },
            },
          }),
          taskEither.chainW(() =>
            server.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainTaskK(
            () => () =>
              new Promise<DocData>((resolve) => {
                const unsub = client.db.onSnapshot({
                  key: { collection: 'user', id: 'kira_id' },
                  onChanged: (docState) => () => {
                    if (either.isRight(docState) && option.isSome(docState.right)) {
                      resolve(docState.right.value);
                      unsub();
                    }
                  },
                })();
              })
          )
        ),
      toResult: either.right({ name: 'masumoto' }),
    }),
  ],
};
