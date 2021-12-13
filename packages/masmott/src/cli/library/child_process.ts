import * as cp from 'child_process';
import * as IO from 'fp-ts/IO';

export const exec =
  (command: string): IO.IO<Buffer> =>
  () =>
    cp.execSync(command);
