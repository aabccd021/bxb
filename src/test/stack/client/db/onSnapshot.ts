/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
import { apply, either, option, taskEither } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import type { DocData } from '../../../../type';
import { test } from '../../../util';

export const test0010 = test({
  name: 'can return a doc is created with client.db.upsertDoc',
  stack: { client: { db: { upsertDoc: true, onSnapshot: true } }, ci: { deployDb: true } },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { create: { type: 'True' }, get: { type: 'True' } },
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
});

export const test0001 = test({
  name: 'can return a doc updated with client.db.upsertDoc',
  stack: { client: { db: { upsertDoc: true, onSnapshot: true } }, ci: { deployDb: true } },
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
});

export const test0002 = test({
  name: 'returns ForbiddedError if forbidden',
  stack: { client: { db: { upsertDoc: true, onSnapshot: true } }, ci: { deployDb: true } },
  expect: ({ client, ci }) =>
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
  toResult: either.left({ code: 'Forbidden' }),
});

export const test0003 = test({
  name: 'returns Forbidden if forbidden and document absent',
  stack: { client: { db: { onSnapshot: true } }, ci: { deployDb: true } },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: { user: { schema: { name: { type: 'StringField' } } } },
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
  toResult: either.left({ code: 'Forbidden' }),
});

export const test0004 = test({
  name: 'can return a doc created with server.db.upsertDoc',
  stack: {
    client: { db: { onSnapshot: true } },
    ci: { deployDb: true },
    server: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci, server }) =>
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
});

export const test0005 = test({
  name: 'can return a doc updated with server.db.upsertDoc',
  stack: {
    client: { db: { onSnapshot: true } },
    ci: { deployDb: true },
    server: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci, server }) =>
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
      taskEither.chainW(() =>
        server.db.upsertDoc({
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
});

export const test0006 = test({
  name: 'can return a doc is created with async client.db.upsertDoc',
  stack: { client: { db: { upsertDoc: true, onSnapshot: true } }, ci: { deployDb: true } },
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
            securityRule: { create: { type: 'True' }, get: { type: 'True' } },
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
            () =>
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
          ),
        })
      ),
      taskEither.map(({ onSnapshotResult }) => onSnapshotResult)
    ),
  toResult: either.right({ name: 'masumoto' }),
});

export const test0007 = test({
  name: 'can return a doc updated with async client.db.upsertDoc',
  stack: { client: { db: { upsertDoc: true, onSnapshot: true } }, ci: { deployDb: true } },
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
            () =>
              new Promise<DocData>((resolve) => {
                const unsub = client.db.onSnapshot({
                  key: { collection: 'user', id: 'kira_id' },
                  onChanged: (docState) => () => {
                    if (
                      either.isRight(docState) &&
                      option.isSome(docState.right) &&
                      docState.right.value['name'] === 'dorokatsu'
                    ) {
                      resolve(docState.right.value);
                      unsub();
                    }
                  },
                })();
              })
          ),
        })
      ),
      taskEither.map(({ onSnapshotResult }) => onSnapshotResult)
    ),
  toResult: either.right({ name: 'dorokatsu' }),
});

export const test0008 = test({
  name: 'can return a doc is created with async server.db.upsertDoc',
  stack: {
    client: { db: { onSnapshot: true } },
    ci: { deployDb: true },
    server: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci, server }) =>
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
            () =>
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
          ),
        })
      ),
      taskEither.map(({ onSnapshotResult }) => onSnapshotResult)
    ),
  toResult: either.right({ name: 'masumoto' }),
});

export const test0009 = test({
  name: 'can return a doc updated with async server.db.upsertDoc',
  stack: {
    client: { db: { onSnapshot: true } },
    ci: { deployDb: true },
    server: { db: { upsertDoc: true } },
  },
  expect: ({ client, ci, server }) =>
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
            () =>
              new Promise<DocData>((resolve) => {
                const unsub = client.db.onSnapshot({
                  key: { collection: 'user', id: 'kira_id' },
                  onChanged: (docState) => () => {
                    if (
                      either.isRight(docState) &&
                      option.isSome(docState.right) &&
                      docState.right.value['name'] === 'dorokatsu'
                    ) {
                      resolve(docState.right.value);
                      unsub();
                    }
                  },
                })();
              })
          ),
        })
      ),
      taskEither.map(({ onSnapshotResult }) => onSnapshotResult)
    ),
  toResult: either.right({ name: 'dorokatsu' }),
});
