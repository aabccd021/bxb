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
  const command = 'firebase emulators:exec "jest && cypress run"';
  const proc = cp.spawn(command, { shell: true });
  proc.stdout.on('data', write);
  proc.stderr.on('data', write);
  proc.on('exit', (code) => {
    console.log(`Done test with exit code: ${code?.toString() ?? ''}`);
  });
};
