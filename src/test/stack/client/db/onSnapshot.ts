/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
import { apply, either, option, taskEither } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import type { DeepPick } from 'ts-essentials';

import type { DocData, Stack } from '../../../../type';
import { defineTest } from '../../../util';

export const test0010 = defineTest({
  name: 'can return a doc is created with client.db.upsertDoc',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly upsertDoc: never; readonly onSnapshot: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
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

export const test0001 = defineTest({
  name: 'can return a doc updated with client.db.upsertDoc',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly upsertDoc: never; readonly onSnapshot: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
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

export const test0002 = defineTest({
  name: 'returns ForbiddedError if forbidden',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly upsertDoc: never; readonly onSnapshot: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
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

export const test0003 = defineTest({
  name: 'returns Forbidden if forbidden and document absent',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly onSnapshot: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
    pipe(
      ci.deployDb({
        type: 'deploy',
        collections: {
          user: {
            schema: { name: { type: 'StringField' } },
          },
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
  toResult: either.left({ code: 'Forbidden' }),
});

export const test0004 = defineTest({
  name: 'can return a doc created with server.db.upsertDoc',
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly onSnapshot: never } };
      readonly ci: { readonly deployDb: never };
      readonly server: { readonly db: { readonly upsertDoc: never } };
    }
  >) =>
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

export const test0005 = defineTest({
  name: 'can return a doc updated with server.db.upsertDoc',
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly onSnapshot: never } };
      readonly ci: { readonly deployDb: never };
      readonly server: { readonly db: { readonly upsertDoc: never } };
    }
  >) =>
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

export const test0006 = defineTest({
  name: 'can return a doc is created with async client.db.upsertDoc',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly upsertDoc: never; readonly onSnapshot: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
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

export const test0007 = defineTest({
  name: 'can return a doc updated with async client.db.upsertDoc',
  expect: ({
    client,
    ci,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly upsertDoc: never; readonly onSnapshot: never } };
      readonly ci: { readonly deployDb: never };
    }
  >) =>
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

export const test0008 = defineTest({
  name: 'can return a doc is created with async server.db.upsertDoc',
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly onSnapshot: never } };
      readonly ci: { readonly deployDb: never };
      readonly server: { readonly db: { readonly upsertDoc: never } };
    }
  >) =>
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

export const test0009 = defineTest({
  name: 'can return a doc updated with async server.db.upsertDoc',
  expect: ({
    client,
    ci,
    server,
  }: DeepPick<
    Stack.Type,
    {
      readonly client: { readonly db: { readonly onSnapshot: never } };
      readonly ci: { readonly deployDb: never };
      readonly server: { readonly db: { readonly upsertDoc: never } };
    }
  >) =>
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
