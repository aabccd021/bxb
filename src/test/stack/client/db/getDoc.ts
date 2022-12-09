import { option, task } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { either } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const tests = [
  defineTest({
    name: 'can client.db.upsertDoc and client.db.getDoc',
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
        taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
      ),
    toResult: either.right(option.some({ name: 'masumoto' })),
  }),
  defineTest({
    name: 'client.db.getDoc always returns the latest doc state',
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
        taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
      ),
    toResult: either.right(option.some({ name: 'dorokatsu' })),
  }),

  defineTest({
    name: 'client.db.upsertDoc does not update doc if update rule is not specified',
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
        taskEither.chainW(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'dorokatsu' },
          })
        ),
        task.chain(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
      ),
    toResult: either.right(option.some({ name: 'masumoto' })),
  }),

  defineTest({
    name: 'client.db.getDoc can not get doc if forbidden',
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
        taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: 'can not get doc if forbidden, even if the doc absent',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            schema: { name: { type: 'StringField' } },
          },
        }),
        taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
      ),
    toResult: either.left({ code: 'ForbiddenError' }),
  }),

  defineTest({
    name: 'can upsert on server and get doc on client',
    expect: ({ server, client, ci }) =>
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
        taskEither.chainW(() => client.db.getDoc({ key: { collection: 'user', id: 'kira_id' } }))
      ),
    toResult: either.right(option.some({ name: 'masumoto' })),
  }),

  defineTest({
    name: 'client.db.upsertDoc fails to create doc if not explicitly allowed',
    expect: ({ client, ci }) =>
      pipe(
        ci.deployDb({
          user: {
            securityRule: {
              get: { type: 'True' },
            },
            schema: { name: { type: 'StringField' } },
          },
        }),
        taskEither.chainW(() =>
          client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          })
        ),
        task.chain(() =>
          client.db.getDoc({
            key: { collection: 'user', id: 'kira_id' },
          })
        )
      ),
    toResult: either.right(option.none),
  }),
];
