import {
  console,
  option,
  readonlyArray,
  readonlyRecord,
  readonlyTuple,
  string,
  taskEither,
} from 'fp-ts';
import { flow, identity, pipe } from 'fp-ts/function';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import { fs, path } from 'fp-ts-node';
import * as realFs from 'fs/promises';
import type { DeepPartial } from 'ts-essentials';

import type { StackWithEnv } from '../type';

type Param = {
  readonly stack: {
    readonly name: string;
    readonly stack: DeepPartial<StackWithEnv>;
  };
};

const methodStr = (scope: string, method: string, { stack }: Param) =>
  `import { stack as ${stack.name}Stack } from 'bxb-stack-${stack.name}'\n` +
  `import { clientEnv as ${stack.name}ClientEnv }` +
  ` from '../../../bxb-stack-${stack.name}.config';\n` +
  `export const ${method} = ${stack.name}Stack.client.${scope}.${method}(${stack.name}ClientEnv);`;

type Scopes = ReadonlyRecord<string, readonly string[]>;

const getScopes = (stack: DeepPartial<DeepPartial<StackWithEnv>>): Scopes =>
  pipe(
    option.fromNullable(stack.client),
    option.map((p) =>
      pipe(
        {
          db: option.fromNullable(p.db),
          auth: option.fromNullable(p.auth),
          storage: option.fromNullable(p.storage),
        },
        readonlyRecord.map(
          option.map(flow(readonlyRecord.filterMap(option.fromNullable), readonlyRecord.keys))
        ),
        readonlyRecord.compact
      )
    ),
    option.getOrElseW(() => ({}))
  );

type WriteFile = { readonly path: string; readonly data: string };

const writeFiles = (fws: readonly WriteFile[]) =>
  pipe(
    fws,
    readonlyArray.traverse(taskEither.ApplicativeSeq)((file) =>
      pipe(
        fs.mkdir({ recursive: true })(path.dirname(file.path)),
        taskEither.chainW(() => fs.writeFile({})(file.data)(file.path))
      )
    )
  );

const getWriteFiles = (param: Param) =>
  pipe(param.stack.stack, getScopes, (scopes) => [
    { path: 'modules/bxb/index.ts', data: `export * as bxb from './bxb'` },
    { path: 'modules/bxb/package.json', data: `{ "sideEffects": false }` },
    {
      path: 'modules/bxb/bxb.ts',
      data: pipe(
        scopes,
        readonlyRecord.keys,
        readonlyArray.map((scope) => `export * as ${scope} from './${scope}';`),
        readonlyArray.intercalate(string.Monoid)('\n')
      ),
    },
    ...pipe(
      scopes,
      readonlyRecord.mapWithIndex((scope, methods) =>
        pipe(
          methods,
          readonlyArray.map((method) => `export * from './${method}'`),
          readonlyArray.intercalate(string.Monoid)('\n'),
          (data) => ({ path: `modules/bxb/${scope}/index.ts`, data })
        )
      ),
      readonlyRecord.toReadonlyArray,
      readonlyArray.map(readonlyTuple.snd)
    ),
    ...pipe(
      scopes,
      readonlyRecord.mapWithIndex((scope, methods) =>
        pipe(
          methods,
          readonlyArray.map((method) => ({
            path: `modules/bxb/${scope}/${method}.ts`,
            data: methodStr(scope, method, param),
          }))
        )
      ),
      readonlyRecord.toReadonlyArray,
      readonlyArray.chain(readonlyTuple.snd)
    ),
  ]);

export const generateNextjs = (param: Param) =>
  pipe(
    taskEither.tryCatch(() => realFs.rm('modules/bxb', { force: true, recursive: true }), identity),
    taskEither.chainW(() => pipe(param, getWriteFiles, writeFiles)),
    taskEither.swap,
    taskEither.chainIOK(console.error),
    taskEither.swap
  );
