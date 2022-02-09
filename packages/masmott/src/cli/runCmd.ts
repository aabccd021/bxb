/* eslint-disable functional/no-conditional-statement */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable functional/no-return-void */
import * as cp from 'child_process';

const prefixBuffer = (prefix: string | undefined, buffer: Buffer) =>
  prefix !== undefined
    ? `${buffer
        .toString()
        .trim()
        .split('\n')
        .map((line) => `${prefix} |> ${line}`)
        .join('\n')}\n`
    : buffer.toString();

export const runCmd = (
  cmd: string,
  options?: cp.SpawnOptionsWithoutStdio & { readonly log?: false; readonly prefix?: string }
): Promise<number | undefined> =>
  new Promise((resolve, reject) => {
    const proc = cp.spawn(cmd, { ...options, shell: true });
    if (options?.log ?? true) {
      proc.stdout.on('data', (buffer: Buffer) =>
        process.stdout.write(prefixBuffer(options?.prefix, buffer))
      );
      proc.stderr.on('data', (buffer: Buffer) =>
        process.stderr.write(prefixBuffer(options?.prefix, buffer))
      );
    }
    proc.on('exit', resolve);
    proc.on('error', reject);
  });
