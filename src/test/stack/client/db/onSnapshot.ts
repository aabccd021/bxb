/* eslint-disable functional/no-return-void */
import { io, option } from 'fp-ts';
import { ioEither } from 'fp-ts';
import { ioOption } from 'fp-ts';
import { either } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { ioRef } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import type { Option } from 'fp-ts/Option';
import * as std from 'fp-ts-std';

import type { DocData } from '../../../../type';
import type { Unsubscribe } from '../../../../type/client/db/OnSnapshot';
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
        taskEither.chainTaskK(
          () => () =>
            new Promise<DocData>((resolve) =>
              pipe(
                ioRef.newIORef<Option<Unsubscribe>>(option.none),
                io.chain((unsubRef) =>
                  pipe(
                    client.db.onSnapshot({
                      key: { collection: 'user', id: 'kira_id' },
                      onChanged: flow(
                        ioEither.fromEither,
                        ioEither.chainIOK(
                          flow(
                            ioOption.fromOption,
                            ioOption.chainIOK((value) =>
                              pipe(
                                () => resolve(value),
                                io.chain(() => unsubRef.read),
                                ioOption.chainIOK((unsub) => unsub)
                              )
                            )
                          )
                        ),
                        io.map(() => undefined)
                      ),
                    }),
                    io.chain(flow(option.some, unsubRef.write))
                  )
                ),
                std.io.execute
              )
            )
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
        taskEither.chainTaskK(
          () => () =>
            new Promise<DocData>((resolve) =>
              pipe(
                ioRef.newIORef<Option<Unsubscribe>>(option.none),
                io.chain((unsubRef) =>
                  pipe(
                    client.db.onSnapshot({
                      key: { collection: 'user', id: 'kira_id' },
                      onChanged: flow(
                        ioEither.fromEither,
                        ioEither.chainIOK(
                          flow(
                            ioOption.fromOption,
                            ioOption.chainIOK((value) =>
                              pipe(
                                () => resolve(value),
                                io.chain(() => unsubRef.read),
                                ioOption.chainIOK((unsub) => unsub)
                              )
                            )
                          )
                        ),
                        io.map(() => undefined)
                      ),
                    }),
                    io.chain(flow(option.some, unsubRef.write))
                  )
                ),
                std.io.execute
              )
            )
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
        taskEither.chainTaskK(
          () => () =>
            new Promise<DocData>((resolve) =>
              pipe(
                ioRef.newIORef<Option<Unsubscribe>>(option.none),
                io.chain((unsubRef) =>
                  pipe(
                    client.db.onSnapshot({
                      key: { collection: 'user', id: 'kira_id' },
                      onChanged: flow(
                        ioEither.fromEither,
                        ioEither.chainIOK(
                          flow(
                            ioOption.fromOption,
                            ioOption.chainIOK((value) =>
                              pipe(
                                () => resolve(value),
                                io.chain(() => unsubRef.read),
                                ioOption.chainIOK((unsub) => unsub)
                              )
                            )
                          )
                        ),
                        io.map(() => undefined)
                      ),
                    }),
                    io.chain(flow(option.some, unsubRef.write))
                  )
                ),
                std.io.execute
              )
            )
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
        taskEither.chainW(
          () => () =>
            new Promise<Either<unknown, unknown>>((resolve) =>
              pipe(
                ioRef.newIORef<Option<Unsubscribe>>(option.none),
                io.chain((unsubRef) =>
                  pipe(
                    client.db.onSnapshot({
                      key: { collection: 'user', id: 'kira_id' },
                      onChanged: flow(
                        ioEither.fromEither,
                        ioEither.swap,
                        ioEither.chainIOK((value) =>
                          pipe(
                            () => resolve(either.left(value)),
                            io.chain(() => unsubRef.read),
                            ioOption.chainIOK((unsub) => unsub)
                          )
                        ),
                        io.map(() => undefined)
                      ),
                    }),
                    io.chain(flow(option.some, unsubRef.write))
                  )
                ),
                std.io.execute
              )
            )
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
        taskEither.chainW(
          () => () =>
            new Promise<Either<unknown, unknown>>((resolve) =>
              pipe(
                ioRef.newIORef<Option<Unsubscribe>>(option.none),
                io.chain((unsubRef) =>
                  pipe(
                    client.db.onSnapshot({
                      key: { collection: 'user', id: 'kira_id' },
                      onChanged: flow(
                        ioEither.fromEither,
                        ioEither.swap,
                        ioEither.chainIOK((value) =>
                          pipe(
                            () => resolve(either.left(value)),
                            io.chain(() => unsubRef.read),
                            ioOption.chainIOK((unsub) => unsub)
                          )
                        ),
                        io.map(() => undefined)
                      ),
                    }),
                    io.chain(flow(option.some, unsubRef.write))
                  )
                ),
                std.io.execute
              )
            )
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
        taskEither.chainTaskK(
          () => () =>
            new Promise<DocData>((resolve) =>
              pipe(
                ioRef.newIORef<Option<Unsubscribe>>(option.none),
                io.chain((unsubRef) =>
                  pipe(
                    client.db.onSnapshot({
                      key: { collection: 'user', id: 'kira_id' },
                      onChanged: flow(
                        ioEither.fromEither,
                        ioEither.chainIOK(
                          flow(
                            ioOption.fromOption,
                            ioOption.chainIOK((value) =>
                              pipe(
                                () => resolve(value),
                                io.chain(() => unsubRef.read),
                                ioOption.chainIOK((unsub) => unsub)
                              )
                            )
                          )
                        ),
                        io.map(() => undefined)
                      ),
                    }),
                    io.chain(flow(option.some, unsubRef.write))
                  )
                ),
                std.io.execute
              )
            )
        )
      ),
    toResult: either.right({ name: 'masumoto' }),
  }),
];
