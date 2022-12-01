import { either, io, ioEither, option, readonlyRecord, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { getDb } from './util';
type Type = Stack['client']['db']['getDoc'];

export const getDoc: Type = (env) => (param) =>
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
    ioEither.map(option.chain(readonlyRecord.lookup(`${param.key.collection}/${param.key.id}`))),
    taskEither.fromIOEither
  );
