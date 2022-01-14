import * as cp from 'child_process';
import * as IO from 'fp-ts/IO';

import { Exec } from '../type';

/**
 *
 */
export const exec =
  ({ command }: Exec): IO.IO<Buffer> =>
  () =>
    cp.execSync(command);
