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
  'page size is different depends on capabilities used',
  async () => {
    const { stdout } = await exec('pnpm next build', {
      cwd: `${__dirname}/packages/app`,
      encoding: 'utf8',
    });
    const getSizeOfPage = (page: string) => {
      const sizeStr = stdout
        .split('\n')
        .filter((s) => s.includes(page))
        .at(0)
        ?.split(' ')
        ?.at(-2);
      // eslint-disable-next-line functional/no-conditional-statement
      if (sizeStr === undefined) {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error(`page ${page} does not exists`);
      }
      return parseFloat(sizeStr);
    };
    expect(getSizeOfPage('/getDoc'))
      .lessThan(getSizeOfPage('/upsertDoc'))
      .lessThan(getSizeOfPage('/both'));
  },
  { timeout: 30000 }
);
