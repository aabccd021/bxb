import cp from 'child_process';
import * as fs from 'fs/promises';
import util from 'util';
import { expect, test } from 'vitest';

const exec = util.promisify(cp.exec);

test('stack-smaller can install packages', async () => {
  await exec('pnpm install', { cwd: `${__dirname}/packages/bxb-stack-smaller`, encoding: 'utf8' });
});

test(
  'stack-smaller can build packages',
  async () => {
    await exec('pnpm build', { cwd: `${__dirname}/packages/bxb-stack-smaller`, encoding: 'utf8' });
  },
  { timeout: 20000 }
);

test('stack-larger can install packages', async () => {
  await exec('pnpm install', { cwd: `${__dirname}/packages/bxb-stack-larger`, encoding: 'utf8' });
});

test(
  'stack-larger can build packages',
  async () => {
    await exec('pnpm build', { cwd: `${__dirname}/packages/bxb-stack-larger`, encoding: 'utf8' });
  },
  { timeout: 20000 }
);

test(
  'pnpm install on app',
  async () => {
    await exec('pnpm install', { cwd: `${__dirname}/packages/app`, encoding: 'utf8' });
  },
  { timeout: 20000 }
);

test(
  'page size is smaller when using smaller stack compared to larger stack',
  async () => {
    const getPageSize = async (param: { readonly production: string; readonly def: string }) => {
      await fs.writeFile(
        `${__dirname}/packages/app/scripts/bxb.ts`,
        `import {appScripts} from 'bxb';` +
          `\nimport * as smaller from 'bxb-stack-smaller';` +
          `\nimport * as larger from 'bxb-stack-larger';` +
          `\nconst main = appScripts({  ` +
          `\n  stacks: {` +
          `\n    env: { production: ${param.production} },` +
          `\n    default: ${param.def}` +
          `\n  }` +
          `\n})` +
          `\nvoid main()`
      );
      await exec('pnpm ts-node ./scripts/bxb.ts generate nextjs', {
        cwd: `${__dirname}/packages/app`,
        encoding: 'utf8',
      });

      const { stdout } = await exec('pnpm next build', {
        cwd: `${__dirname}/packages/app`,
        encoding: 'utf8',
      });
      const sizeStr = stdout
        .split('\n')
        .filter((s) => s.includes('/getDoc'))
        .at(0)
        ?.split(' ')
        ?.at(-2);
      // eslint-disable-next-line functional/no-conditional-statement
      if (sizeStr === undefined) {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error(`page /getDoc does not exists`);
      }
      return parseFloat(sizeStr);
    };

    const smallerStackPageSize = await getPageSize({ production: 'smaller', def: 'larger' });
    const largerStackPageSize = await getPageSize({ production: 'larger', def: 'smaller' });
    expect(smallerStackPageSize).lessThan(largerStackPageSize);
  },
  { timeout: 60000 }
);
