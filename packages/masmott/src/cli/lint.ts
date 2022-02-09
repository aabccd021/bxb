/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */

import { runCmd } from './runCmd';

export const lintCli = async (args: readonly string[]) =>
  runCmd(`yarn eslint ./ --ext ts,tsx ${args.join(' ')}`, { prefix: 'lint' });
