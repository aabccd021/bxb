/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
// eslint-disable-next-line functional/no-return-void

import * as cp from 'child_process';

import { build } from './build';

const write = (data: Buffer) => process.stdout.write(data.toString());

export const test = () => {
  console.log('Start test');
  build();
  const commandStr = 'firebase emulators:exec "jest && cypress run"';
  const cmd = cp.spawn(commandStr, { shell: true });
  cmd.stdout.on('data', write);
  cmd.stderr.on('data', write);
  cmd.on('exit', (code) => {
    console.log(`Done test with exit code: ${code?.toString() ?? ''}`);
  });
};
