// const args = process.argv.slice(2);

import * as BOOL from 'fp-ts/boolean';
import * as C from 'fp-ts/Console';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as A from 'fp-ts/ReadonlyArray';
import { Validation } from 'io-ts';
import { match } from 'ts-adt';

import * as fs from './library/fs';
import * as ts from './library/typescript';
import * as pure from './pure';
import {
  CompileServerCmdArgs,
  GenerateCmdAction,
  GenerateCmdArgs,
  WriteFileAction,
} from './type';

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
const doNothing: IO.IO<void> = () => {};

/**
 *
 */
const logError = C.error;

/**
 *
 */
const mkdirIfAbsent = (path: string) =>
  pipe(
    path,
    fs.exists,
    IO.chain(
      BOOL.match(
        () => fs.mkdir({ options: { recursive: true }, path }),
        () => doNothing
      )
    )
  );

/**
 *
 */
const rmdirIfExists = (path: string) =>
  pipe(
    path,
    fs.exists,
    IO.chain(
      BOOL.match(
        () => doNothing,
        () => fs.rm({ options: { recursive: true }, path })
      )
    )
  );

/**
 *
 */
const writeFile = ({ dir, name, content }: WriteFileAction): IO.IO<void> =>
  pipe(
    mkdirIfAbsent(dir),
    IO.chain(() => fs.writeFile(`${dir}/${name}`, content))
  );

/**
 *
 */
const runVoidActions = (action: GenerateCmdAction): IO.IO<void> =>
  pipe(action, match({ logError, writeFile }));

/**
 *
 */
const generate = (_: GenerateCmdArgs): IO.IO<void> =>
  pipe(
    fs.readFileAsString({
      options: { encoding: 'utf-8' },
      path: './masmott.yaml',
    }),
    IO.chain(
      flow(
        pure.generate,
        E.map(flow(A.map(runVoidActions), IO.sequenceArray)),
        E.getOrElse(logError)
      )
    ),
    // IO.chain(() => CP.exec('yarn lint --fix')),
    IO.chain(() => C.log(`@@@`))
  );

/**
 *
 */
const compileServer = (_: CompileServerCmdArgs): IO.IO<void> =>
  pipe(
    pure.serverOutDir,
    rmdirIfExists,
    IO.chain(() => pipe(pure.serverCompilerProgram, ts.emitProgram))
  );

/**
 *
 */
const decodeAndRun = <A>(
  decode: (args: readonly string[]) => Validation<A>,
  handle: (a: A) => IO.IO<void>
) =>
  E.orElse((args: readonly string[]) =>
    pipe(
      args,
      decode,
      E.map(handle),
      E.mapLeft(() => args)
    )
  );

/**
 *
 */
export const cli: IO.IO<void> = pipe(
  process.argv.slice(2),
  E.left,
  decodeAndRun(GenerateCmdArgs.decode, generate),
  decodeAndRun(CompileServerCmdArgs.decode, compileServer),
  E.getOrElse(() => logError(`unknown command`))
);
