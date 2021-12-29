import { identity } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import * as fs from 'fs';

import { MkDir, ReadFile, Rm, WriteFile } from '../type';

/**
 *
 */
export const readFile = ({ path, options }: ReadFile) =>
  IOE.tryCatch(() => fs.readFileSync(path, options), identity);

/**
 *
 */
export const writeFile =
  ({ path, data, options }: WriteFile): IO.IO<void> =>
  () =>
    fs.writeFileSync(path, data, options);

/**
 *
 */
export const exists =
  (path: fs.PathLike): IO.IO<boolean> =>
  () =>
    fs.existsSync(path);

/**
 *
 */
export const mkdir =
  ({ path, options }: MkDir): IO.IO<string | undefined> =>
  () =>
    fs.mkdirSync(path, options);

/**
 *
 */
export const rm =
  ({ path, options }: Rm): IO.IO<void> =>
  () =>
    fs.rmSync(path, options);
