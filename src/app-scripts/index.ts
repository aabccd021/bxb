import { console, readonlyArray, readonlyTuple, string } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import * as std from 'fp-ts-std';
import { join } from 'fp-ts-std/ReadonlyArray';
import { match } from 'ts-pattern';

import * as generate from './generate';
import type { Param } from './type';

export const appScripts = (param: Param): IO<unknown> | Task<unknown> =>
  pipe(process.argv, readonlyArray.splitAt(2), readonlyTuple.snd, (args) =>
    match(args)
      .when(std.readonlyArray.startsWith(string.Eq)(['generate']), (generateArgs) =>
        pipe(generateArgs, readonlyArray.splitAt(1), readonlyTuple.snd, generate.main(param))
      )
      .otherwise(flow(join(' '), (command) => `command not founda: ${command}`, console.error))
  );
