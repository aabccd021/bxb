import { either, io, ioEither, option, readonlyRecord, string, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { setObjectItem } from '../../util';
import { dbLocalStorageKey, getDb } from './util';
type Type = Stack['client']['db']['upsertDoc'];

export const upsertDoc: Type = (env) => (param) =>
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
        (config) =>
          config[param.key.collection]?.securityRule?.create?.type === 'True' &&
          pipe(
            param.data,
            readonlyRecord.mapWithIndex(
              (fieldName, fieldValue) =>
                config[param.key.collection]?.schema[fieldName]?.type === 'StringField' &&
                typeof fieldValue === 'string'
            ),
            readonlyRecord.reduce(string.Ord)(true, (a, b) => a && b)
          ),
        () => ({ code: 'ForbiddenError' as const })
      )
    ),
    ioEither.chainW(() => getDb(env.getWindow)),
    ioEither.map(
      flow(
        option.getOrElse(() => ({})),
        readonlyRecord.upsertAt(`${param.key.collection}/${param.key.id}`, param.data)
      )
    ),
    ioEither.chainIOK((data) => setObjectItem(env.getWindow, dbLocalStorageKey, data)),
    taskEither.fromIOEither
  );
