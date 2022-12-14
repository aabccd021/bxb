import { either, taskEither } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { ReadonlyRecord } from 'fp-ts/lib/ReadonlyRecord';
import type { TaskEither } from 'fp-ts/TaskEither';
import type { DeepPick } from 'ts-essentials';

import type { Stack } from '../../../../type';
import type { Suite } from '../../../util';
import { defineTest } from '../../../util';

export type Testo<P, T> = {
  readonly expect: (stack: P) => TaskEither<unknown, T>;
  readonly toResult: Either<unknown, T>;
  readonly type?: 'fail';
  readonly timeOut?: number;
  readonly retry?: number;
};

export const defineTesto = <T, P>(t: Testo<T, P>) => t;

// eslint-disable-next-line no-use-before-define
export type Testos = ReadonlyRecord<string, Testo<any, any>>;
};

export const a = {
  'can upsert doc': defineTesto({
    expect: ({
      server,
      ci,
    }: DeepPick<
      Stack.Type,
      {
        readonly server: { readonly db: { readonly upsertDoc: never } };
        readonly ci: { readonly deployDb: never };
      }
    >) =>
      pipe(
        ci.deployDb({
          type: 'deploy',
          collections: {
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: { create: { type: 'True' } },
            },
          },
        }),
        taskEither.chainW(() =>
          server.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        ),
        taskEither.chainW(() => taskEither.right('upload success'))
      ),
    toResult: either.right('upload success'),
  }),

  'can upsert doc even if client.db.upserDoc is forbidden by security rule': defineTesto({
    expect: ({ server, ci }: DeepPick<Stack.Type, { readonly client: { readonly db: never } }>) =>
      pipe(
        ci.deployDb({
          type: 'deploy',
          collections: {
            user: {
              schema: { name: { type: 'StringField' } },
              securityRule: { get: { type: 'True' } },
            },
          },
        }),
        taskEither.chainW(() =>
          server.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        ),
        taskEither.chainW(() => taskEither.right('upload success'))
      ),
    toResult: either.right('upload success'),
  }),
} satisfies Testos;

export type STT = DeepPick<Stack.Type, { readonly client: never }>

export const res: readonly Testo<STT, unknown>[] = [
  a['can upsert doc'],
  a['can upsert doc even if client.db.upserDoc is forbidden by security rule'],
  a['can upsert doc'],
];

export const suite: Suite = {
  name: 'server.db.upsertDoc',
  tests: [
    defineTest({
      name: 'can upsert doc',
      expect: ({ server, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                schema: { name: { type: 'StringField' } },
                securityRule: { create: { type: 'True' } },
              },
            },
          }),
          taskEither.chainW(() =>
            server.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(() => taskEither.right('upload success'))
        ),
      toResult: either.right('upload success'),
    }),

    defineTest({
      name: 'can upsert doc even if client.db.upserDoc is forbidden by security rule',
      expect: ({ server, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              user: {
                schema: { name: { type: 'StringField' } },
                securityRule: { get: { type: 'True' } },
              },
            },
          }),
          taskEither.chainW(() =>
            server.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            })
          ),
          taskEither.chainW(() => taskEither.right('upload success'))
        ),
      toResult: either.right('upload success'),
    }),

    defineTest({
      name: `can create doc even if not signed in`,
      expect: ({ server, ci }) =>
        pipe(
          ci.deployDb({
            type: 'deploy',
            collections: {
              tweet: {
                schema: { owner: { type: 'StringField' } },
                securityRule: {
                  create: {
                    type: 'Equal',
                    compare: [{ type: 'AuthUid' }, { type: 'DocumentField', fieldName: 'owner' }],
                  },
                },
              },
            },
          }),
          taskEither.chainW(() =>
            server.db.upsertDoc({
              key: { collection: 'tweet', id: '1' },
              data: { owner: 'random auth user uid' },
            })
          ),
          taskEither.map(() => 'upsert success')
        ),
      toResult: either.right('upsert success'),
    }),
  ],
};
