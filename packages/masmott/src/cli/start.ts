/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */

import { Masmott } from 'core';

import { buildCli } from './build';
import { compileAndRunCLI } from './compile';
import { runCmd } from './runCmd';

export const startCli = async (args: readonly string[]) => {
  if (args[0] !== '--quick') {
    const exit = await buildCli();
    if (exit !== 0) {
      return exit;
    }
  }
  return compileAndRunCLI('start');
};

export const start = (masmott: Masmott) =>
  runCmd(`firebase emulators:start --project ${masmott?.firebase?.projectId ?? __dirname}`, {
    prefix: 'start',
  });
