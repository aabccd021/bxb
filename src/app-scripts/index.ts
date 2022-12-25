import { console, readonlyArray, readonlyTuple, string } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import { match } from 'ts-pattern';

import * as generate from './generate';
import type { Param } from './type';

export const appScripts = (param: Param): IO<unknown> | Task<unknown> =>
  pipe(process.argv, readonlyArray.splitAt(2), readonlyTuple.snd, (args) =>
    match(args)
      .when(
        (r: readonly string[]) =>
          pipe(r, readonlyArray.takeLeft(1), (arr) =>
            readonlyArray.getEq(string.Eq).equals(arr, ['generate'])
          ),
        (generateArgs: readonly string[]) =>
          pipe(generateArgs, readonlyArray.splitAt(1), readonlyTuple.snd, generate.main(param))
      )
      .otherwise(
        flow(
          readonlyArray.intercalate(string.Monoid)(' '),
          (command) => `command not founda: ${command}`,
          console.error
        )
      )
  );
