import * as cp from 'child_process';
import { taskEither } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';
import { logErrorDetails, runTests } from 'pure-test';
import { exit } from 'pure-test/dist/node';
import * as util from 'util';

import { makeTest } from './test';

const test = makeTest({
  exec: ({ command, cwd }: { readonly command: string; readonly cwd: string }) =>
    taskEither.tryCatch(
      () => util.promisify(cp.exec)(command, { cwd, encoding: 'utf8' }),
      identity
    ),
});

export const main = pipe([test], runTests({}), logErrorDetails, exit);
