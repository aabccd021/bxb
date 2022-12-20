import cp from 'child_process';
import util from 'util';
import { expect, test } from 'vitest';

const exec = util.promisify(cp.exec);

test('stack-foo can install packages', async () => {
  await exec('pnpm install', { cwd: `${__dirname}/packages/bxb-stack-foo`, encoding: 'utf8' });
});

test(
  'stack-foo can build packages',
  async () => {
    await exec('pnpm build', { cwd: `${__dirname}/packages/bxb-stack-foo`, encoding: 'utf8' });
  },
  { timeout: 20000 }
);

test(
  'can generate for nextjs app',
  async () => {
    await exec('pnpm ts-node ./scripts/bxb.ts generate nextjs', {
      cwd: `${__dirname}/packages/app`,
      encoding: 'utf8',
    });
  },
  { timeout: 20000 }
);

test(
  'can build nextjs app',
  async () => {
    const { stdout } = await exec('pnpm next build', {
      cwd: `${__dirname}/packages/app`,
      encoding: 'utf8',
    });
    const sizes = stdout.split('\n').filter((s) => s.endsWith('kB') && s.includes('○ '));
    expect(sizes).toEqual([
      '┌ ○ /404                                   214 B          78.9 kB',
      '├ ○ /both                                  552 B          82.5 kB',
      '├ ○ /getDoc                                542 B            81 kB',
      '└ ○ /upsertDoc                             431 B          81.8 kB',
    ]);
  },
  { timeout: 30000 }
);
