/* eslint-disable functional/no-conditional-statement */
import { either, io, ioEither, ioOption, ioRef, option } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import type { Option } from 'fp-ts/Option';
// eslint-disable-next-line fp-ts/no-module-imports
import { chainTaskK, chainW as then } from 'fp-ts/TaskEither';
import * as std from 'fp-ts-std';

import type { DocData, FunctionsBuilder } from '..';
import type { Unsubscribe } from '../type/client/db/OnSnapshot';
import type { Test } from '.';

const path = __filename.replaceAll('masmott/dist/es6', 'masmott/dist/cjs');

export const independencyFunctions: FunctionsBuilder = (server) => ({
  functions: {
    createDocOnAuthCreated: {
      trigger: 'onAuthCreated',
      handler: () =>
        server.db.upsertDoc({
          key: { collection: 'detection', id: '1' },
          data: { status: 'true' },
        }),
    },
  },
});

export const independencyTest1: Test<unknown> = {
  name: `a test can deploy trigger`,
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      then(() =>
        ci.deployFunctions({
          functions: { path, exportName: 'independencyFunctions' },
          server,
        })
      ),
      then(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      chainTaskK(
        () => () =>
          new Promise<DocData>((resolve) => {
            pipe(
              ioRef.newIORef<Option<Unsubscribe>>(option.none),
              io.chain((unsubRef) =>
                pipe(
                  client.db.onSnapshot({
                    key: { collection: 'detection', id: '1' },
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
                      io.map((_: Either<unknown, unknown>) => undefined)
                    ),
                  }),
                  io.chain(flow(option.some, unsubRef.write))
                )
              ),
              std.io.execute
            );
          })
      )
    ),
  toResult: either.right({ status: 'true' }),
};

export const independencyTest2: Test<unknown> = {
  name: `another test shouldn't be affected by trigger from another test`,
  type: 'fail',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      then(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      chainTaskK(
        () => () =>
          new Promise<DocData>((resolve) => {
            pipe(
              ioRef.newIORef<Option<Unsubscribe>>(option.none),
              io.chain((unsubRef) =>
                pipe(
                  client.db.onSnapshot({
                    key: { collection: 'detection', id: '1' },
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
                      io.map((_: Either<unknown, unknown>) => undefined)
                    ),
                  }),
                  io.chain(flow(option.some, unsubRef.write))
                )
              ),
              std.io.execute
            );
          })
      )
    ),
  toResult: either.right({ status: 'true' }),
};

export const test2Functions: FunctionsBuilder = (server) => ({
  functions: {
    detectUserExists: {
      trigger: 'onAuthCreated',
      handler: () =>
        server.db.upsertDoc({
          key: { collection: 'detection', id: '1' },
          data: { status: 'true' },
        }),
    },
  },
});

export const test2: Test<unknown> = {
  name: `onAuthCreated trigger can upsert doc`,
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      then(() =>
        ci.deployFunctions({
          functions: { path, exportName: 'test2Functions' },
          server,
        })
      ),
      then(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      chainTaskK(
        () => () =>
          new Promise<DocData>((resolve) => {
            pipe(
              ioRef.newIORef<Option<Unsubscribe>>(option.none),
              io.chain((unsubRef) =>
                pipe(
                  client.db.onSnapshot({
                    key: { collection: 'detection', id: '1' },
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
                      io.map((_: Either<unknown, unknown>) => undefined)
                    ),
                  }),
                  io.chain(flow(option.some, unsubRef.write))
                )
              ),
              std.io.execute
            );
          })
      )
    ),
  toResult: either.right({ status: 'true' }),
};

export const test3Functions: FunctionsBuilder = (server) => ({
  functions: {
    detectUserExists: {
      trigger: 'onAuthCreated',
      handler: () =>
        server.db.upsertDoc({
          key: { collection: 'detection', id: '1' },
          data: { status: 'true' },
        }),
    },
  },
});

export const test3: Test<unknown> = {
  name: `onAuthCreated trigger should not be called if not triggered`,
  type: 'fail',
  expect: ({ client, ci, server }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      then(() =>
        ci.deployFunctions({
          functions: { path, exportName: 'test3Functions' },
          server,
        })
      ),
      chainTaskK(
        () => () =>
          new Promise<DocData>((resolve) => {
            pipe(
              ioRef.newIORef<Option<Unsubscribe>>(option.none),
              io.chain((unsubRef) =>
                pipe(
                  client.db.onSnapshot({
                    key: { collection: 'detection', id: '1' },
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
                      io.map((_: Either<unknown, unknown>) => undefined)
                    ),
                  }),
                  io.chain(flow(option.some, unsubRef.write))
                )
              ),
              std.io.execute
            );
          })
      )
    ),
  toResult: either.right({ status: 'true' }),
};

export const test4: Test<unknown> = {
  name: `document should not be created if trigger not deployed`,
  type: 'fail',
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      then(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      chainTaskK(
        () => () =>
          new Promise<DocData>((resolve) => {
            pipe(
              ioRef.newIORef<Option<Unsubscribe>>(option.none),
              io.chain((unsubRef) =>
                pipe(
                  client.db.onSnapshot({
                    key: { collection: 'detection', id: '1' },
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
                      io.map((_: Either<unknown, unknown>) => undefined)
                    ),
                  }),
                  io.chain(flow(option.some, unsubRef.write))
                )
              ),
              std.io.execute
            );
          })
      )
    ),
  toResult: either.right({ status: 'true' }),
};
