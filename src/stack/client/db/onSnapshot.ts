import { io, ioEither, option, readonlyRecord } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { getDb, notifySubscriberWithOnChanged, stringifyDocKey } from '../../util';
type Type = Stack['client']['db']['onSnapshot'];

export const onSnapshot: Type = (env) => (param) =>
  pipe(
    getDb(env.getWindow),
    ioEither.map(option.chain(readonlyRecord.lookup(stringifyDocKey(param.key)))),
    io.chain((docState) =>
      notifySubscriberWithOnChanged({ env, key: param.key, onChanged: param.onChanged, docState })
    ),
    ioEither.chainIOK(() =>
      pipe(
        env.onDocChangedCallback.read,
        io.map(readonlyRecord.upsertAt(stringifyDocKey(param.key), param.onChanged)),
        io.chain(env.onDocChangedCallback.write)
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
