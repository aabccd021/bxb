import { ioEither, option, readonlyRecord, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { dbLocalStorageKey, getDb, setObjectItem } from '../../util';

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
    taskEither.fromIOEither
  );
