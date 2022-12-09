/* eslint-disable functional/no-return-void */
import { option } from 'fp-ts';
import { either } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'can return doc after a doc is created with client.db.upsertDoc',
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
        taskEither.chainTaskK(() =>
          client.db.getDocWhen({
            key: { collection: 'user', id: 'kira_id' },
            select: either.match(() => option.none, identity),
          })
        )
      ),
    toResult: either.right({ name: 'masumoto' }),
  }),

  defineTest({
    name: 'can return doc after a doc is updated with client.db.upsertDoc',
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
        taskEither.chainTaskK(() =>
          client.db.getDocWhen({
            key: { collection: 'user', id: 'kira_id' },
            select: either.match(() => option.none, identity),
          })
        )
      ),
    toResult: either.right({ name: 'dorokatsu' }),
  }),

  defineTest({
    name: `callback doesn't called after unsubscribed`,
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
        taskEither.chainTaskK(() =>
          client.db.getDocWhen({
            key: { collection: 'user', id: 'kira_id' },
            select: either.match(() => option.none, identity),
          })
        )
      ),
    toResult: either.right({ name: 'masumoto' }),
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
        taskEither.chainTaskK(() =>
          client.db.getDocWhen({
            key: { collection: 'user', id: 'kira_id' },
            select: either.match(option.some, () => option.none),
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: 'client.db.getDoc returns ForbiddenError if forbidden and document absent',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
          },
        }),
        taskEither.chainTaskK(() =>
          client.db.getDocWhen({
            key: { collection: 'user', id: 'kira_id' },
            select: either.match(option.some, () => option.none),
          })
        )
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: 'can return doc after a doc is created with server.db.upsertDoc',
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
        taskEither.chainTaskK(() =>
          client.db.getDocWhen({
            key: { collection: 'user', id: 'kira_id' },
            select: either.match(() => option.none, identity),
          })
        )
      ),
    toResult: either.right({ name: 'masumoto' }),
  }),
];
