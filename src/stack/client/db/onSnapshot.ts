import { either, io, ioEither, option, readonlyRecord } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { getDb, stringifyDocKey } from '../../util';
type Type = Stack['client']['db']['onSnapshot'];

export const onSnapshot: Type = (env) => (param) =>
  pipe(
    env.dbDeployConfig.read,
    io.map(
      either.fromOption(() => ({
        code: 'ProviderError' as const,
        provider: 'mock',
        value: 'db deploy config not found',
      }))
    ),
    ioEither.chainEitherKW(
      either.fromPredicate(
        flow(
          readonlyRecord.lookup(param.key.collection),
          option.map((collectionConfig) => collectionConfig.securityRule?.get?.type === 'True'),
          option.getOrElse(() => false)
        ),
        () => ({ code: 'ForbiddenError' as const })
      )
    ),
    ioEither.chainW(() => getDb(env.getWindow)),
    ioEither.map(option.chain(readonlyRecord.lookup(stringifyDocKey(param.key)))),
    io.chainFirst(param.onChanged),
    ioEither.chainIOK(() =>
      pipe(
        env.onDocChangedCallback.read,
        io.map(readonlyRecord.upsertAt(stringifyDocKey(param.key), param.onChanged))
      )
    ),
    // unsubscribe
    io.map(() =>
      pipe(
        env.onDocChangedCallback.read,
        io.map(readonlyRecord.deleteAt(stringifyDocKey(param.key))),
        io.chain(env.onDocChangedCallback.write)
      )
    )
  );
