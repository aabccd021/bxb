/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import {
  console,
  ioEither,
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
import { fs } from 'fp-ts-node';
import * as std from 'fp-ts-std';
import * as fsSync from 'fs';
import type { DeepPartial } from 'ts-essentials';

import type { StackWithEnv } from '../../type';
import type { Param } from '../type';

const getAllStacks = (param: Param) =>
  pipe(
    param.envStacks,
    readonlyRecord.toReadonlyArray,
    readonlyArray.map(readonlyTuple.snd),
    readonlyArray.append(param.defaultStack)
  );

const methodStr = (scope: string, method: string, param: Param) =>
  pipe(
    {
      stackImports: pipe(
        getAllStacks(param),
        readonlyNonEmptyArray.map(
          (stack) => `import { stack as ${stack.name}Stack } from 'bxb-stack-${stack.name}';`
        ),
        std.readonlyArray.join('\n')
      ),
      envImports: pipe(
        getAllStacks(param),
        readonlyNonEmptyArray.map(
          (stack) =>
            `import { clientEnv as ${stack.name}ClientEnv } from '../../../bxb-stack-${stack.name}.config';`
        ),
        std.readonlyArray.join('\n')
      ),
      methods: pipe(
        param.envStacks,
        readonlyRecord.toReadonlyArray,
        readonlyArray.map(
          ([nodeEnv, stack]) =>
            `process.env.NODE_ENV === '${nodeEnv}' ` +
            `? ${stack.name}Stack.client.${scope}.${method}(${stack.name}ClientEnv) :`
        ),
        std.readonlyArray.join('\n')
      ),
    },
    ({ stackImports, envImports, methods }) =>
      `${stackImports}\n${envImports}\nexport const ${method}` +
      ` = ${methods} ${param.defaultStack.name}Stack.client.${scope}.${method}(${param.defaultStack.name}ClientEnv);`
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

export const main = (param: Param) => (_args: readonly string[]) =>
  pipe(
    taskEither.fromIOEither(
      ioEither.tryCatch(
        () => fsSync.rmSync('modules/bxb', { force: true, recursive: true }),
        identity
      )
    ),
    taskEither.chainW(() => fs.mkdir({ recursive: true })('modules/bxb')),
    taskEither.chainW(() =>
      fs.writeFile({})(`export * as bxb from './bxb'`)('modules/bxb/index.ts')
    ),
    taskEither.chainW(() =>
      fs.writeFile({})(`{ "sideEffects": false }`)('modules/bxb/package.json')
    ),
    taskEither.map(() =>
      pipe(
        getAllStacks(param),
        readonlyNonEmptyArray.map((stackOption) => getScopes(stackOption.stack)),
        readonlyNonEmptyArray.concatAll(
          readonlyRecord.getIntersectionSemigroup(readonlyArray.getIntersectionSemigroup(string.Eq))
        )
      )
    ),
    taskEither.chainFirstW((scopes) =>
      pipe(
        scopes,
        readonlyRecord.keys,
        readonlyArray.map((scope) => `export * as ${scope} from './${scope}';`),
        std.readonlyArray.join('\n'),
        (content) => fs.writeFile({})(content)('modules/bxb/bxb.ts')
      )
    ),
    taskEither.chainW(
      readonlyRecord.traverseWithIndex(taskEither.ApplicativeSeq)((scope, methods) =>
        pipe(
          fs.mkdir({ recursive: true })(`modules/bxb/${scope}`),
          taskEither.chain(() =>
            pipe(
              methods,
              readonlyArray.map((method) => `export * from './${method}'`),
              std.readonlyArray.join('\n'),
              (content) => fs.writeFile({})(content)(`modules/bxb/${scope}/index.ts`)
            )
          ),
          taskEither.chain(() =>
            pipe(
              methods,
              readonlyArray.traverse(taskEither.ApplicativeSeq)((method) =>
                fs.writeFile({})(methodStr(scope, method, param))(
                  `modules/bxb/${scope}/${method}.ts`
                )
              )
            )
          )
        )
      )
    ),
    taskEither.swap,
    taskEither.chainIOK(console.error)
  );
