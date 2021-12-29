// const args = process.argv.slice(2);

import * as Console from 'fp-ts/Console';
import { flow, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as Arr from 'fp-ts/ReadonlyArray';
import { match } from 'ts-adt';

import * as cp from './library/child_process';
import * as fs from './library/fs';
import * as ts from './library/typescript';
import * as pure from './pure';
import { Action, MkDirIfAbsent, RmDirIfExists } from './type';

/**
 *
 */
const runAction = (action: Action): IO.IO<unknown> =>
  pipe(
    action,
    match({
      //
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      doNothing: () => () => {},

      //
      emitProgram: ts.emitProgram,

      //
      exec: cp.exec,

      //
      logError: Console.error,

      //
      mkDir: fs.mkdir,

      //
      // eslint-disable-next-line no-use-before-define
      mkDirAndWriteFile: flow(pure.mkDirAndWriteFile, runActions),

      //
      mkDirIfAbsent: ({ path }: MkDirIfAbsent) =>
        // eslint-disable-next-line no-use-before-define
        pipe(path, fs.exists, chainActions(pure.mkDirIfFalse(path))),

      //
      rm: fs.rm,

      //
      rmDirIfExists: ({ path }: RmDirIfExists) =>
        // eslint-disable-next-line no-use-before-define
        pipe(path, fs.exists, chainActions(pure.rmDirIfTrue(path))),

      //
      // eslint-disable-next-line no-use-before-define
      writeFile: fs.writeFile,
    })
  );

/**
 *
 */
const runActions = flow(Arr.map(runAction), IO.sequenceArray);

/**
 *
 */
const chainActions = <B>(f: (b: B) => readonly Action[]) =>
  IO.chain(flow(f, runActions));

/**
 *
 */
export const cli: IO.IO<void> = pipe(
  pure.readMasmottConfigFile,
  fs.readFile,
  chainActions(pure.doCmd(process.argv))
);
