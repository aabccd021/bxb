import cp from 'child_process';
import util from 'util';
import { test } from 'vitest';

const exec = util.promisify(cp.exec);

test('stack-foo can install packages', async () => {
  await exec('pnpm install', {
    cwd: `${__dirname}/packages/bxb-stack-foo`,
    encoding: 'utf8',
  });
});

test(
  'stack-foo can build packages',
  async () => {
    await exec('pnpm build', {
      cwd: `${__dirname}/packages/bxb-stack-foo`,
      encoding: 'utf8',
    });
  },
  { timeout: 20000 }
);

test('stack-bar can install packages', async () => {
  await exec('pnpm install', {
    cwd: `${__dirname}/packages/bxb-stack-bar`,
    encoding: 'utf8',
  });
});

test(
  'stack-bar can build packages',
  async () => {
    await exec('pnpm build', {
      cwd: `${__dirname}/packages/bxb-stack-bar`,
      encoding: 'utf8',
    });
  },
  { timeout: 20000 }
);

test(
  'can generate for nextjs app',
  async () => {
    await exec('pnpm ts-node-esm ./scripts/bxb.ts generate nextjs', {
      cwd: `${__dirname}/packages/app-nextjs`,
      encoding: 'utf8',
    });
  },
  { timeout: 20000 }
);

test(
  'can build nextjs app',
  async () => {
    await exec('pnpm next build', {
      cwd: `${__dirname}/packages/app-nextjs`,
      encoding: 'utf8',
    });
  },
  { timeout: 30000 }
);
