/* eslint-disable functional/no-conditional-statement */
import { either, io, ioEither, ioOption } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
// eslint-disable-next-line fp-ts/no-module-imports
import { chainTaskK, chainW as then } from 'fp-ts/TaskEither';

import type { DocData, FunctionsBuilder } from '..';
import type { Test } from '.';

const path = __filename.replaceAll('masmott/dist/es6', 'masmott/dist/cjs');

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
  name: `onAuthCreated can upsert doc`,
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
          new Promise<DocData>((resolve) =>
            client.db.onSnapshot({
              key: { collection: 'detection', id: '1' },
              onChanged: flow(
                ioEither.fromEither,
                ioEither.chainIOK(
                  flow(
                    ioOption.fromOption,
                    ioOption.chainIOK((value) => () => resolve(value))
                  )
                ),
                io.map((_: Either<unknown, unknown>) => undefined)
              ),
            })
          )
      )
    ),
  toResult: either.right({ status: 'true' }),
};
