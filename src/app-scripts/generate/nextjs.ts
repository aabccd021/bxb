import {
  console,
  option,
  readonlyArray,
  readonlyNonEmptyArray,
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

import type { StackWithEnv } from '../../type';
import type { Param } from '../type';

const getAllStacks = (param: Param) =>
  pipe(
    option.fromNullable(param.stacks.env),
    option.getOrElseW(() => ({})),
    readonlyRecord.toReadonlyArray,
    readonlyArray.map(readonlyTuple.snd),
    readonlyArray.append(param.stacks.default)
  );

const methodStr = (scope: string, method: string, param: Param) =>
  pipe(
    param,
    getAllStacks,
    (stacks) => ({
      stackImports: pipe(
        stacks,
        readonlyNonEmptyArray.map(
          (stack) => `import { stack as ${stack.name}Stack } from 'bxb-stack-${stack.name}';`
        ),
        readonlyArray.intercalate(string.Monoid)('\n')
      ),
      envImports: pipe(
        stacks,
        readonlyNonEmptyArray.map(
          (stack) =>
            `import { clientEnv as ${stack.name}ClientEnv } ` +
            `from '../../../bxb-stack-${stack.name}.config';`
        ),
        readonlyArray.intercalate(string.Monoid)('\n')
      ),
      methods: pipe(
        option.fromNullable(param.stacks.env),
        option.getOrElseW(() => ({})),
        readonlyRecord.toReadonlyArray,
        readonlyArray.map(
          ([nodeEnv, stack]) =>
            `process.env.NODE_ENV === '${nodeEnv}' ` +
            `? ${stack.name}Stack.client.${scope}.${method}(${stack.name}ClientEnv) :`
        ),
        readonlyArray.intercalate(string.Monoid)('\n')
      ),
    }),
    ({ stackImports, envImports, methods }) =>
      `${stackImports}\n${envImports}\nexport const ${method}` +
      ` = ${methods} ${param.stacks.default.name}Stack.client.${scope}.${method}` +
      `(${param.stacks.default.name}ClientEnv);`
  );

type Scopes = ReadonlyRecord<string, readonly string[]>;

const getScopes = (stack: DeepPartial<StackWithEnv>): Scopes =>
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
  pipe(
    param,
    getAllStacks,
    readonlyNonEmptyArray.map((stackOption) => getScopes(stackOption.stack)),
    readonlyNonEmptyArray.concatAll(
      readonlyRecord.getIntersectionSemigroup(readonlyArray.getIntersectionSemigroup(string.Eq))
    ),
    (scopes) => [
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
    ]
  );

export const main = (param: Param) => (_args: readonly string[]) =>
  pipe(
    taskEither.tryCatch(() => realFs.rm('modules/bxb', { force: true, recursive: true }), identity),
    taskEither.chainW(() => pipe(param, getWriteFiles, writeFiles)),
    taskEither.swap,
    taskEither.chainIOK(console.error)
  );
