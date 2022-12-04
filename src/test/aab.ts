import { either, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
// eslint-disable-next-line fp-ts/no-module-imports
import { chainW as then, tryCatch } from 'fp-ts/TaskEither';

import type { Stack } from '../type';
import type { Test } from '.';

export const functions: Stack.ci.DeployFunctions.Param = {
  functions: {
    detectUserExists: {
      trigger: 'onAuthCreated',
      handler: ({ server }) =>
        server.db.upsertDoc({
          key: { collection: 'detection', id: '1' },
          data: { status: 'true' },
        }),
    },
  },
};

export const test: Test<unknown> = {
  name: `aabccd`,
  expect: ({ client, ci }) =>
    pipe(
      ci.deployDb({
        detection: {
          schema: { status: { type: 'StringField' } },
          securityRule: { get: { type: 'True' } },
        },
      }),
      then(() =>
        tryCatch(
          async () =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            await import(__filename).then((f) => f.functions as Stack.ci.DeployFunctions.Param),
          () => ({ code: 'aabccd' })
        )
      ),
      then(ci.deployFunctions),
      then(() =>
        client.auth.createUserAndSignInWithEmailAndPassword({
          email: 'kira@sakurazaka.com',
          password: 'dorokatsu',
        })
      ),
      then(() => client.db.getDoc({ key: { collection: 'detection', id: '1' } }))
    ),
  toResult: either.right(option.some({ status: 'true' })),
};
