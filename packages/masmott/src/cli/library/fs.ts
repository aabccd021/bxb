import { identity } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import * as fs from 'fs';

type PathLike = string | Buffer | URL;
type PathOrFileDescriptor = PathLike | number;

type ObjectEncodingOptions = {
  readonly encoding?: BufferEncoding | null | undefined;
};
type Abortable = {
  /**
   * When provided the corresponding `AbortController` can be used to cancel an
   * asynchronous action.
   */
  readonly signal?: AbortSignal | undefined;
};
type Mode = number | string;
type WriteFileOptions =
  | (ObjectEncodingOptions &
      Abortable & {
        readonly flag?: string | undefined;
        readonly mode?: Mode | undefined;
      })
  | BufferEncoding
  | null;
type MakeDirectoryOptions = {
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

/**
 *
 */
export const readFileAsString = (
  path: PathOrFileDescriptor,
  options:
    | {
        readonly encoding: BufferEncoding;
        readonly flag?: string | undefined;
      }
    | BufferEncoding
) => IOE.tryCatch(() => fs.readFileSync(path, options), identity);

/**
 *
 */
export const writeFile =
  (
    file: PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView,
    options?: WriteFileOptions
  ): IO.IO<void> =>
  () =>
    fs.writeFileSync(file, data, options);

/**
 *
 */
export const exists =
  (path: PathLike): IO.IO<boolean> =>
  () =>
    fs.existsSync(path);

/**
 *
 */
export const mkdir =
  (
    path: PathLike,
    options: MakeDirectoryOptions & {
      readonly recursive: true;
    }
  ): IO.IO<string | undefined> =>
  () =>
    fs.mkdirSync(path, options);
