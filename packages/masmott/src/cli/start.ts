/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
// eslint-disable-next-line functional/no-return-void

import { build } from './build';
import { runCmd } from './runCmd';

export const start = async (isQuick: boolean) => {
  console.log('Start start');
  if (!isQuick) {
    const exit = await build();
    if (exit !== 0) {
      return exit;
    }
  }
  const command = 'firebase emulators:start';
  const exitCode = await runCmd(command);
  console.log(`Done start with exit code: ${exitCode?.toString() ?? ''}`);
  return exitCode;
};
