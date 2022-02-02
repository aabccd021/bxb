/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */

import { runCmd } from './runCmd';

export const lintCli = async (args: readonly string[]) => {
  console.log('Start lint');
  const commandArgs = args.join(' ');
  const command = `yarn eslint ./ --ext ts,tsx ${commandArgs}`;
  const exitCode = await runCmd(command);
  console.log(`Done lint with exit code: ${exitCode?.toString() ?? ''}`);
  return exitCode;
};
