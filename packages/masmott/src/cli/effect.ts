// const args = process.argv.slice(2);

import { MasmottConfig } from '@src/core/type';
import * as C from 'fp-ts/Console';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import * as A from 'fp-ts/ReadonlyArray';
import { Validation } from 'io-ts';
import { match } from 'ts-adt';

import * as fs from './library/fs';
import { emitProgram } from './library/typescript';
import * as pure from './pure';
import {
  Action,
  CompileServerCmdArgs,
  GenerateCmdArgs,
  MkDirIfAbsent,
  RmDirIfExists,
} from './type';

/**
 *
 */
const runAction = (action: Action): IO.IO<unknown> =>
  pipe(
    action,
    match({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      doNothing: () => () => {},

      //
      emitProgram,

      //
      logError: C.error,

      //
      mkDir: fs.mkdir,

      // eslint-disable-next-line no-use-before-define
      mkDirAndWriteFile,

      // eslint-disable-next-line no-use-before-define
      mkDirIfAbsent,

      //
      rm: fs.rm,

      // eslint-disable-next-line no-use-before-define
      rmDirIfExists,

      // eslint-disable-next-line no-use-before-define
      writeFile: fs.writeFile,
    })
  );

/**
 *
 */
const runActions = flow(A.map(runAction), IO.sequenceArray);

/**
 *
 */
const chainActions = <A>(f: (a: A) => readonly Action[]) =>
  IO.chain(flow(f, runActions));

/**
 *
 */
const mkDirIfAbsent = ({ path }: MkDirIfAbsent) =>
  pipe(path, fs.exists, chainActions(pure.mkDirIfFalse(path)));

/**
 *
 */
const rmDirIfExists = ({ path }: RmDirIfExists) =>
  pipe(path, fs.exists, chainActions(pure.rmDirIfTrue(path)));

/**
 *
 */
const mkDirAndWriteFile = flow(pure.mkDirAndWriteFile, runActions);

/**
/**
 *
 */
const getMasmottConfig: IOE.IOEither<unknown, MasmottConfig> = pipe(
  pure.readMasmottConfigFile,
  fs.readFile,
  IO.map(pure.decodeMasmottConfig)
);

/**
 *
 */
const generate = (_: GenerateCmdArgs): IO.IO<void> =>
  pipe(
    getMasmottConfig,
    chainActions(pure.generate)
    // IO.chain(() => CP.exec('yarn lint --fix')),
    // IO.chain(() => C.log(`@@@`))
  );

/**
 *
 */
const compileServer = (_: CompileServerCmdArgs): IO.IO<void> =>
  pipe(
    getMasmottConfig,
    chainActions(pure.compileServer)
    // IO.chain(() => CP.exec('yarn lint --fix')),
    // IO.chain(() => C.log(`@@@`))
  );

/**
 *
 */
const runCmd = <A>(
  decode: (args: readonly string[]) => Validation<A>,
  handle: (a: A) => IO.IO<void>
) =>
  E.orElse((args: readonly string[]) =>
    pipe(
      args,
      decode,
      E.mapLeft((_decodeError) => args),
      E.map(handle)
    )
  );

/**
 *
 */
export const cli: IO.IO<void> = pipe(
  process.argv.slice(2),
  E.left,
  runCmd(GenerateCmdArgs.decode, generate),
  runCmd(CompileServerCmdArgs.decode, compileServer),
  E.getOrElse(flow(pure.logErrorUnknownCommand, runAction))
);
