/* eslint-disable no-use-before-define */
// const args = process.argv.slice(2);

import * as Console from 'fp-ts/Console';
import { flow, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as Arr from 'fp-ts/ReadonlyArray';
import { match } from 'ts-adt';

import * as child_process from './library/child_process';
import * as fs from './library/fs';
import * as typescript from './library/typescript';
import * as pure from './pure';
import { Action, MkdirIfAbsent, RmdirIfExists } from './type';

/**
 *
 */
const runAction = (action: Action): IO.IO<unknown> =>
  pipe(
    action,
    match({
      ...typescript,
      ...child_process,
      ...fs,
      doNothing: (_) => IO.of(void),
      logError: Console.error,
      mkdirIfAbsent: ({ path }: MkdirIfAbsent) =>
        pipe(path, fs.exists, chainRunActions(pipe(path, pure.mkdirIfFalse))),
      rmdirIfExists: ({ path }: RmdirIfExists) =>
        pipe(path, fs.exists, chainRunActions(pipe(path, pure.rmdirIfTrue))),
    })
  );

/**
 *
 */
const runActions = flow(Arr.map(runAction), IO.sequenceArray);

/**
 *
 */
const chainRunActions = <B>(f: (b: B) => readonly Action[]) =>
  IO.chain(flow(f, runActions));

/**
 *
 */
export const cli: IO.IO<void> = pipe(
  pure.readMasmottConfigFile,
  fs.readFile,
  chainRunActions(pipe(process.argv, pure.doCmd))
);
