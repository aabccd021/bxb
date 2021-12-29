import { Dict } from '@core/type';
import { Either } from 'fp-ts/Either';
import { Option } from 'fp-ts/Option';
import * as fs from 'fs';
import * as t from 'io-ts';
import * as ts from 'typescript';

export type { CompilerOptions } from 'typescript';
export { ModuleKind, ScriptTarget } from 'typescript';

export const GenerateCmdArgs = t.tuple([t.literal('generate')]);
export type GenerateCmdArgs = t.TypeOf<typeof GenerateCmdArgs>;

export const CompileServerCmdArgs = t.tuple([t.literal('build')]);
export type CompileServerCmdArgs = t.TypeOf<typeof CompileServerCmdArgs>;

// eslint-disable-next-line no-use-before-define
export type WriteFileDict = Dict<WriteFileEntry>;

export type CompileServerCtx = {
  readonly indexFileName: string;
  readonly options: ts.CompilerOptions;
  readonly outputDir: string;
  readonly target: ts.ScriptTarget;
};

export type EitherWriteFileEntry = {
  readonly _type: 'either';
  readonly content: Either<unknown, string>;
};

export type StringWriteFileEntry = {
  readonly _type: 'string';
  readonly content: string;
};

export type NestedWriteFileEntry = {
  readonly _type: 'nested';
  readonly content: WriteFileDict;
};

export type WriteFileEntry =
  | StringWriteFileEntry
  | EitherWriteFileEntry
  | NestedWriteFileEntry;

export type LogError = {
  readonly _type: 'logError';
  readonly errorDetail: unknown;
};

export type SourceFile = {
  readonly content: string;
  readonly fileName: string;
  readonly target: ts.ScriptTarget;
};

export type CompilerHostGetSourceFile = (
  name: string,
  languageVersion: ts.ScriptTarget
) => Option<SourceFile>;

export type FileDiagnostic = {
  readonly character: number;
  readonly fileName: string;
  readonly line: number;
};

export type Diagnostic = {
  readonly fileDiagnostic: Option<FileDiagnostic>;
  readonly message: string;
};

export type EmitResult = {
  readonly diagnostics: readonly Diagnostic[];
  readonly emitSkipped: boolean;
};

export type WriteFile = {
  readonly _type: 'writeFile';
  readonly data: string | NodeJS.ArrayBufferView;
  readonly options?: fs.WriteFileOptions;
  readonly path: fs.PathOrFileDescriptor;
};

export type MkDirAndWriteFile = {
  readonly _type: 'mkDirAndWriteFile';
  readonly data: string;
  readonly dir: string;
  readonly name: string;
};

export type MkDirIfAbsent = {
  readonly _type: 'mkDirIfAbsent';
  readonly path: string;
};

export type DoNothing = {
  readonly _type: 'doNothing';
};

export type RmDirIfExists = {
  readonly _type: 'rmDirIfExists';
  readonly path: string;
};

export type Rm = {
  readonly _type: 'rm';
  readonly options: fs.RmOptions;
  readonly path: fs.PathLike;
};

export type MkDir = {
  readonly _type: 'mkDir';
  readonly options: fs.MakeDirectoryOptions & {
    readonly recursive: true;
  };
  readonly path: fs.PathLike;
};

export type EmitProgram = {
  readonly _type: 'emitProgram';
  readonly getSourceFile?: CompilerHostGetSourceFile;
  readonly options: ts.CompilerOptions;
  readonly rootNames: readonly string[];
};

export type ReadFile = {
  readonly _type: 'readFile';
  readonly options:
    | {
        readonly encoding: BufferEncoding;
        readonly flag?: string | undefined;
      }
    | BufferEncoding;
  readonly path: fs.PathOrFileDescriptor;
};

export type Exec = {
  readonly _type: 'exec';
  readonly command: string;
};

export type Action =
  | DoNothing
  | EmitProgram
  | Exec
  | LogError
  | MkDir
  | MkDirIfAbsent
  | MkDirAndWriteFile
  | Rm
  | RmDirIfExists
  | WriteFile;
