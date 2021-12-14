import { MasmottConfig } from '@src/core/type';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as A from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/ReadonlyRecord';

import * as YAML from './library/yaml';
import { WriteFileAction, WriteFileDict } from './type';

export const decodeConfig = flow(YAML.load, E.chainW(MasmottConfig.decode));

export const writeFileDictToActions =
  (baseDir: string) =>
  (dict: WriteFileDict): readonly WriteFileAction[] =>
    pipe(
      dict,
      R.toReadonlyArray,
      A.chain(([key, content]) =>
        typeof content === 'string'
          ? [{ content, dir: baseDir, name: key }]
          : writeFileDictToActions(`${baseDir}/${key}`)(content)
      )
    );

// {
//   return Object.entries(dict).flatMap(([key, content]) => {
//     if (typeof content === 'string') {
//       return { content, dir: baseDir, name: key };
//     }
//     return writeFileDictToActions(content, `${baseDir}/${key}`);
//   });
// }

export const makeWriteFileActions = (
  config: MasmottConfig
): readonly WriteFileAction[] =>
  pipe(
    {
      // '.babelrc': babelrc,
      // cypress: {
      //   plugins: {
      //     'index.js': cypressPlugins,
      //   },
      //   support: {
      //     'index.js': cypressSupport,
      //   },
      //   'tsconfig.json': cypressTsconfig,
      // },
      // 'cypress.json': cypress,
      // 'firebase.json': firebaseJson,
      // 'firestore.indexes.json': firestoreIndexJson,
      // 'firestore.rules': firestoreRules,
      // 'masmott.ts': makeClientStr(config),
      // 'next-env.d.ts': nextEnv,
      // 'next.config.js': nextConfig,
      // 'package.json': packageJson(config.firebase.projectId),
      // pages: {
      //   api: {
      //     '__coverage__.js': apiCoverage,
      //   },
      // },
      // 'tsconfig.json': tsconfig,
    },
    writeFileDictToActions('.')
  );
