/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable functional/no-return-void */
import * as cp from 'child_process';

const prefixBuffer = (prefix: string, buffer: Buffer) =>
  `${buffer
    .toString()
    .split('\n')
    .map((line) => `${prefix}$${line}`)
    .join('\n')}\n`;

export const runCmd = (
  cmd: string,
  prefix: string,
  options?: cp.SpawnOptionsWithoutStdio
): Promise<number | undefined> =>
  new Promise((resolve, reject) => {
    const proc = cp.spawn(cmd, { ...options, shell: true });
    proc.stdout.on('data', (buffer: Buffer) => process.stdout.write(prefixBuffer(prefix, buffer)));
    proc.stderr.on('data', (buffer: Buffer) => process.stderr.write(prefixBuffer(prefix, buffer)));
    proc.on('exit', resolve);
    proc.on('error', reject);
  });
