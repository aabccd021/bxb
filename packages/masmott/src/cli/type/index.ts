import { Dict } from '@core/type';
import { Either } from 'fp-ts/Either';
import { Option } from 'fp-ts/Option';
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

export type LogErrorAction = {
  readonly _type: 'logError';
  readonly errorDetail: unknown;
};

export type WriteFileAction = {
  readonly _type: 'writeFile';
  readonly content: string;
  readonly dir: string;
  readonly name: string;
};

export type GenerateCmdAction = WriteFileAction | LogErrorAction;

export type PathLike = string | Buffer | URL;
export type PathOrFileDescriptor = PathLike | number;

export type ObjectEncodingOptions = {
  readonly encoding?: BufferEncoding | null | undefined;
};
export type Abortable = {
  /**
   * When provided the corresponding `AbortController` can be used to cancel an
   * asynchronous action.
   */
  readonly signal?: AbortSignal | undefined;
};
export type Mode = number | string;
export type WriteFileOptions =
  | (ObjectEncodingOptions &
      Abortable & {
        readonly flag?: string | undefined;
        readonly mode?: Mode | undefined;
      })
  | BufferEncoding
  | null;

export type MakeDirectoryOptions = {
  /**
   * A file mode. If a string is passed, it is parsed as an octal integer. If
   * not specified
   * @default 0o777
   */
  readonly mode?: Mode | undefined;
  /**
   * Indicates whether parent folders should be created. If a folder was
   * created, the path to the first created folder will be returned.
   * @default false
   */
  readonly recursive?: boolean | undefined;
};

export type RmOptions = {
  /**
   * When `true`, exceptions will be ignored if `path` does not exist.
   * @default false
   */
  readonly force?: boolean | undefined;
  /**
   * If an `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, or `EPERM` error is
   * encountered, Node.js will retry the operation with a linear backoff wait of
   * `retryDelay` ms longer on each try. This option represents the number of
   * retries. This option is ignored if the `recursive` option is not `true`.
   * @default 0
   */
  readonly maxRetries?: number | undefined;
  /**
   * If `true`, perform a recursive directory removal. In
   * recursive mode, operations are retried on failure.
   * @default false
   */
  readonly recursive?: boolean | undefined;
  /**
   * The amount of time in milliseconds to wait between retries.
   * This option is ignored if the `recursive` option is not `true`.
   * @default 100
   */
  readonly retryDelay?: number | undefined;
};

export type ReadFileAsStringParams = {
  readonly options:
    | {
        readonly encoding: BufferEncoding;
        readonly flag?: string | undefined;
      }
    | BufferEncoding;
  readonly path: PathOrFileDescriptor;
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

export type CompilerProgram = {
  readonly getSourceFile?: CompilerHostGetSourceFile;
  readonly options: ts.CompilerOptions;
  readonly rootNames: readonly string[];
};

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
