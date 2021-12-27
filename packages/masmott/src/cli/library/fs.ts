import { identity } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import * as fs from 'fs';

import {
  MakeDirectoryOptions,
  PathLike,
  PathOrFileDescriptor,
  ReadFileAsStringParams,
  RmOptions,
  WriteFileOptions,
} from '../type';

/**
 *
 */
export const readFileAsString = ({ path, options }: ReadFileAsStringParams) =>
  IOE.tryCatch(() => fs.readFileSync(path, options), identity);

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
  ({
    path,
    options,
  }: {
    readonly options: MakeDirectoryOptions & {
      readonly recursive: true;
    };
    readonly path: PathLike;
  }): IO.IO<string | undefined> =>
  () =>
    fs.mkdirSync(path, options);

/**
 *
 */
export const rm =
  ({
    path,
    options,
  }: {
    readonly options: RmOptions;
    readonly path: PathLike;
  }): IO.IO<void> =>
  () =>
    fs.rmSync(path, options);
