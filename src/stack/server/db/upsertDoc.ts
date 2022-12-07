import { either, ioEither, option, readonlyRecord, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { dbLocalStorageKey, getDb, notifySubscriber, setObjectItem } from '../../util';

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
      notifySubscriber({ env, key: param.key, docState: either.right(option.some(param.data)) })
    ),
    ioEither.map(() => undefined),
    taskEither.fromIOEither
  );
