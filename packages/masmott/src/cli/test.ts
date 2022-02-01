/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
// eslint-disable-next-line functional/no-return-void

import { build } from './build';
import { runCmd } from './runCmd';

export const test = async () => {
  console.log('Start test');
  build();
  const command = 'firebase emulators:exec "jest && cypress run"';
  const exitCode = await runCmd(command);
  console.log(`Done test with exit code: ${exitCode?.toString() ?? ''}`);
};
