import { either, io, ioEither, ioOption, option, readonlyRecord, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { dbLocalStorageKey, getDb, setObjectItem, stringifyDocKey } from '../../util';

type Type = Stack['server']['db']['upsertDoc'];

export const upsertDoc: Type = (env) => (param) =>
  pipe(
    getDb(env.getWindow),
    ioEither.map(
      flow(
        option.getOrElse(() => ({})),
        readonlyRecord.upsertAt(`${param.key.collection}/${param.key.id}`, param.data)
      )
    ),
    ioEither.chainIOK((data) => setObjectItem(env.getWindow, dbLocalStorageKey, data)),
    ioEither.chainIOK(() =>
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
        ioEither.map(() => option.some(param.data)),
        io.chain((docState) =>
          pipe(
            env.onDocChangedCallback.read,
            io.map(readonlyRecord.lookup(stringifyDocKey(param.key))),
            ioOption.chainIOK((onDocChangedCallback) => onDocChangedCallback(docState))
          )
        )
      )
    ),
    ioEither.map(() => undefined),
    taskEither.fromIOEither
  );
