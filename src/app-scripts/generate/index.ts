import { console, readonlyArray, readonlyTuple, string } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import * as std from 'fp-ts-std';
import { join } from 'fp-ts-std/ReadonlyArray';
import { match } from 'ts-pattern';

import type { Param } from '../type';
import * as nextjs from './nextjs';

export const main =
  (param: Param) =>
  (args: readonly string[]): IO<unknown> | Task<unknown> =>
    match(args)
      .when(std.readonlyArray.startsWith(string.Eq)(['nextjs']), (nextjsArgs) =>
        pipe(nextjsArgs, readonlyArray.splitAt(1), readonlyTuple.snd, nextjs.main(param))
      )
      .otherwise(flow(join(' '), (command) => `command not foundz: ${command}`, console.error));
