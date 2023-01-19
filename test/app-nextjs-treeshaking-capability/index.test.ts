import cp from 'child_process';
import { either, option, readonlyArray, readonlyRecord, string, taskEither } from 'fp-ts';
import { flow, identity, pipe } from 'fp-ts/function';
import { logErrorDetails, runTests, test } from 'pure-test';
import { exit } from 'pure-test/dist/node';
import util from 'util';

const exec = ({ command, cwd }: { readonly command: string; readonly cwd: string }) =>
  taskEither.tryCatch(() => util.promisify(cp.exec)(command, { cwd, encoding: 'utf8' }), identity);

const tests = [
  test({
    timeout: 60000,
    name: 'page size is different depends on capabilities used',
    act: pipe(
      exec({ command: 'pnpm install', cwd: `${__dirname}/packages/bxb-stack-foo` }),
      taskEither.chain(() =>
        exec({ command: 'pnpm build', cwd: `${__dirname}/packages/bxb-stack-foo` })
      ),
      taskEither.chain(() => exec({ command: 'pnpm install', cwd: `${__dirname}/packages/app` })),
      taskEither.chain(() =>
        exec({ command: 'pnpm exec-main ./scripts/bxb', cwd: `${__dirname}/packages/app` })
      ),
      taskEither.chain(() =>
        exec({ command: 'pnpm next build', cwd: `${__dirname}/packages/app` })
      ),
      taskEither.chainEitherKW(({ stdout }) =>
        pipe(
          { '/getDoc': undefined, '/upsertDoc': undefined, '/both': undefined },
          readonlyRecord.traverseWithIndex(option.Applicative)((pageName) =>
            pipe(
              stdout,
              string.split('\n'),
              readonlyArray.filter(string.includes(pageName)),
              readonlyArray.head,
              option.chain(flow(string.split(' '), readonlyArray.dropRight(1), readonlyArray.last)),
              option.map(parseFloat)
            )
          ),
          option.map(
            (pageSize) =>
              pageSize['/both'] > pageSize['/upsertDoc'] &&
              pageSize['/upsertDoc'] > pageSize['/getDoc']
          ),
          either.fromOption(() => 'page not found')
        )
      )
    ),
    assert: either.right(true),
  }),
];

export const main = pipe(tests, runTests({}), logErrorDetails, exit);
