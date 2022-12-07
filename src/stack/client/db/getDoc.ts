import { ioEither, option, readonlyRecord, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { Stack } from '../../type';
import { getDb, stringifyDocKey, validateGetDoc } from '../../util';
type Type = Stack['client']['db']['getDoc'];

export const getDoc: Type = (env) => (param) =>
  pipe(
    validateGetDoc({ env, key: param.key }),
    ioEither.chainW(() => getDb(env.getWindow)),
    ioEither.map(option.chain(readonlyRecord.lookup(stringifyDocKey(param.key)))),
    taskEither.fromIOEither
  );
