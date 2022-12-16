import { ioEither, option, readonlyRecord, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { getDb } from '../../util';
type Type = Stack['server']['db']['getDoc'];

export const getDoc: Type = (env) => (param) =>
  pipe(
    getDb(env.getWindow),
    ioEither.map(option.chain(readonlyRecord.lookup(`${param.key.collection}/${param.key.id}`))),
    taskEither.fromIOEither,
    taskEither.mapLeft((err) => ({ ...err, capability: 'server.db.getDoc' }))
  );
