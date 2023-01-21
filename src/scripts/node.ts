import * as nodeFs from 'node:fs/promises';
import * as nodePath from 'node:path';

import { taskEither } from 'fp-ts';
import { identity } from 'fp-ts/function';

import { generateNextjsF } from './generateNextjsF';

export const generateNextjs = generateNextjsF({
  fs: {
    mkdirRecursive: ({ path }) =>
      taskEither.tryCatch(() => nodeFs.mkdir(path, { recursive: true }), identity),
    writeFile: ({ path, data }) =>
      taskEither.tryCatch(() => nodeFs.writeFile(path, data), identity),
    rmForceRecursive: ({ path }) =>
      taskEither.tryCatch(() => nodeFs.rm(path, { force: true, recursive: true }), identity),
  },
  path: { dirname: nodePath.dirname },
});
