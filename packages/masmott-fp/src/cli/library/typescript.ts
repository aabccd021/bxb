import { sequenceT } from 'fp-ts/Apply';
import { flow, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/ReadonlyArray';
import * as ts from 'typescript';

import {
  Diagnostic,
  EmitProgram,
  EmitResult,
  FileDiagnostic,
  SourceFile,
} from '../type';

const _createSourceFile = ({ content, fileName, target }: SourceFile) =>
  ts.createSourceFile(fileName, content, target);

const _createProgram =
  (rootNames: readonly string[]) =>
  (options: ts.CompilerOptions) =>
  (host: ts.CompilerHost) =>
    ts.createProgram(rootNames, options, host);

const createProgram = ({ options, getSourceFile, rootNames }: EmitProgram) =>
  pipe(
    options,
    ts.createCompilerHost,
    (compilerHost) => ({
      ...compilerHost,
      getSourceFile: (name: string, languageVersion: ts.ScriptTarget) =>
        pipe(
          O.fromNullable(getSourceFile),
          O.chain((impl) =>
            pipe(impl(name, languageVersion), O.map(_createSourceFile))
          ),
          O.getOrElse(() => compilerHost.getSourceFile(name, languageVersion))
        ),
    }),
    _createProgram(rootNames)(options)
  );

const _emit = (program: ts.Program): IO.IO<ts.EmitResult> => program.emit;

const createEmitResult =
  (emitSkipped: boolean) =>
  (diagnostics: readonly Diagnostic[]): EmitResult => ({
    diagnostics,
    emitSkipped,
  });

const createDiagnosticWithMessage =
  (message: string) =>
  (fileDiagnostic: O.Option<FileDiagnostic>): Diagnostic => ({
    fileDiagnostic,
    message,
  });

const createFileDiagnostic = ([file, start]: readonly [
  ts.SourceFile,
  number
]): FileDiagnostic => ({
  ...ts.getLineAndCharacterOfPosition(file, start),
  fileName: file.fileName,
});

const wrapEmitResult =
  (program: ts.Program) =>
  ({ diagnostics, emitSkipped }: ts.EmitResult) =>
    pipe(
      diagnostics,
      A.concat(ts.getPreEmitDiagnostics(program)),
      A.map(({ file, start, messageText }) =>
        pipe(
          sequenceT(O.Apply)(O.fromNullable(file), O.fromNullable(start)),
          O.map(createFileDiagnostic),
          createDiagnosticWithMessage(
            ts.flattenDiagnosticMessageText(messageText, '\n')
          )
        )
      ),
      createEmitResult(emitSkipped)
    );

const emitAndWrapResult = (program: ts.Program): IO.IO<EmitResult> =>
  pipe(program, _emit, IO.map(wrapEmitResult(program)));

export const emitProgram = flow(createProgram, emitAndWrapResult);
