import { console, readonlyArray, readonlyTuple, string } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import { match } from 'ts-pattern';

import type { Param } from '../type';
import * as nextjs from './nextjs';

export const main =
  (param: Param) =>
  (args: readonly string[]): IO<unknown> | Task<unknown> =>
    match(args)
      .when(
        (r) =>
          pipe(r, readonlyArray.takeLeft(1), (arr) =>
            readonlyArray.getEq(string.Eq).equals(arr, ['generate'])
          ),
        (nextjsArgs) =>
          pipe(nextjsArgs, readonlyArray.splitAt(1), readonlyTuple.snd, nextjs.main(param))
      )
      .otherwise(
        flow(
          readonlyArray.intercalate(string.Monoid)(' '),
          (command) => `command not foundz: ${command}`,
          console.error
        )
      );
