import { Masmott } from 'core';

import { compileAndRunCLI } from './compile';
import { runCmd } from './runCmd';
import { defaultProjectId } from './utils';

export const devCli = () => compileAndRunCLI('dev');

export const dev = (masmott: Masmott) =>
  runCmd(
    `start-server-and-test ` +
      `'firebase emulators:start --project ${masmott?.firebase?.projectId ?? defaultProjectId}' ` +
      `http://localhost:4000 ` +
      `'next dev'`,
    { prefix: 'dev' }
  );
