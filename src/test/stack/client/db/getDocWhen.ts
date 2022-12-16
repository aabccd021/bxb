/* eslint-disable functional/no-return-void */
import { apply, either, option, taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';

import { defineTest } from '../../../util';

export const test0001 = defineTest({
  name: 'can return doc after a doc is created with client.db.upsertDoc',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              create: { type: 'True' },
              get: { type: 'True' },
            },
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
});

export const test0002 = defineTest({
  name: 'can return doc after a doc is updated with client.db.upsertDoc',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              create: { type: 'True' },
              update: { type: 'True' },
              get: { type: 'True' },
            },
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
});

export const test0003 = defineTest({
  name: 'returns ForbiddedError if forbidden',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              create: { type: 'True' },
            },
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
        client.db.getDocWhen({
          key: { collection: 'user', id: 'kira_id' },
          select: option.some,
        })
      )
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.db.getDocWhen' }),
});

export const test0004 = defineTest({
  name: 'client.db.getDoc returns Forbidden if forbidden and document absent',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
          },
        },
      }),
      taskEither.chainW(() =>
        client.db.getDocWhen({
          key: { collection: 'user', id: 'kira_id' },
          select: option.some,
        })
      )
    ),
  toResult: either.left({ code: 'Forbidden', capability: 'client.db.getDocWhen' }),
});

export const test0005 = defineTest({
  name: 'can return doc after a doc is created with server.db.upsertDoc',
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              get: { type: 'True' },
            },
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
});

export const test0006 = defineTest({
  name: 'can return a doc is created with async client.db.upsertDoc',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              create: { type: 'True' },
              get: { type: 'True' },
            },
          },
        },
      }),
      taskEither.chainW(() =>
        apply.sequenceS(taskEither.ApplyPar)({
          createResult: client.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          }),
          onSnapshotResult: taskEither.fromTask(
            client.db.getDocWhen({
              key: { collection: 'user', id: 'kira_id' },
              select: either.match(() => option.none, identity),
            })
          ),
        })
      ),
      taskEither.map(({ onSnapshotResult }) => onSnapshotResult)
    ),
  toResult: either.right({ name: 'masumoto' }),
});

export const test0007 = defineTest({
  name: 'can return a doc updated with async client.db.upsertDoc',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: {
              create: { type: 'True' },
              update: { type: 'True' },
              get: { type: 'True' },
            },
          },
        },
      }),
      taskEither.chainW(() =>
        apply.sequenceS(taskEither.ApplyPar)({
          createResult: pipe(
            client.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            }),
            taskEither.chainW(() =>
              client.db.upsertDoc({
                key: { collection: 'user', id: 'kira_id' },
                data: { name: 'dorokatsu' },
              })
            )
          ),
          onSnapshotResult: taskEither.fromTask(
            client.db.getDocWhen({
              key: { collection: 'user', id: 'kira_id' },
              select: either.match(
                () => option.none,
                option.chain(option.fromPredicate((docData) => docData['name'] === 'dorokatsu'))
              ),
            })
          ),
        })
      ),
      taskEither.map(({ onSnapshotResult }) => onSnapshotResult)
    ),
  toResult: either.right({ name: 'dorokatsu' }),
});

export const test0008 = defineTest({
  name: 'can return a doc is created with async server.db.upsertDoc',
  expect: ({ server, ci, client }) =>
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
        apply.sequenceS(taskEither.ApplyPar)({
          createResult: server.db.upsertDoc({
            key: { collection: 'user', id: 'kira_id' },
            data: { name: 'masumoto' },
          }),
          onSnapshotResult: taskEither.fromTask(
            client.db.getDocWhen({
              key: { collection: 'user', id: 'kira_id' },
              select: either.match(() => option.none, identity),
            })
          ),
        })
      ),
      taskEither.map(({ onSnapshotResult }) => onSnapshotResult)
    ),
  toResult: either.right({ name: 'masumoto' }),
});

export const test0009 = defineTest({
  name: 'can return a doc updated with async server.db.upsertDoc',
  expect: ({ server, ci, client }) =>
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
        apply.sequenceS(taskEither.ApplyPar)({
          createResult: pipe(
            server.db.upsertDoc({
              key: { collection: 'user', id: 'kira_id' },
              data: { name: 'masumoto' },
            }),
            taskEither.chainW(() =>
              server.db.upsertDoc({
                key: { collection: 'user', id: 'kira_id' },
                data: { name: 'dorokatsu' },
              })
            )
          ),
          onSnapshotResult: taskEither.fromTask(
            client.db.getDocWhen({
              key: { collection: 'user', id: 'kira_id' },
              select: either.match(
                () => option.none,
                option.chain(option.fromPredicate((docData) => docData['name'] === 'dorokatsu'))
              ),
            })
          ),
        })
      ),
      taskEither.map(({ onSnapshotResult }) => onSnapshotResult)
    ),
  toResult: either.right({ name: 'dorokatsu' }),
});
