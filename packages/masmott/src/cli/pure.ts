import { MasmottConfig } from '@core/type';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as json from 'fp-ts/Json';
import * as A from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/ReadonlyRecord';
import { Validation } from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { match } from 'ts-adt';

import * as YAML from './library/yaml';
import {
  EitherWriteFileEntry,
  GenerateCmdAction,
  LogErrorAction,
  WriteFileAction,
  WriteFileDict,
} from './type';

/**
 *
 */
export const logErrorAction = (errorDetail: unknown): LogErrorAction => ({
  _type: 'logError',
  errorDetail,
});

/**
 *
 */
export const eitherWriteFileEntry = (
  content: E.Either<unknown, string>
): EitherWriteFileEntry => ({
  _type: 'either',
  content,
});

/**
 *
 */
export const jsonFileEntry = flow(json.stringify, eitherWriteFileEntry);

/**
 *
 */
export const writeFileAction =
  (dir: string, name: string) =>
  (content: string): WriteFileAction => ({
    _type: 'writeFile',
    content,
    dir,
    name,
  });

/**
 *
 */
export const writeFileDictToActions =
  (baseDir: string) =>
  (dict: WriteFileDict): readonly GenerateCmdAction[] =>
    pipe(
      dict,
      R.toReadonlyArray,
      A.chain(([key, value]) =>
        pipe(
          value,
          match({
            either: flow(
              (_) => _.content,
              E.map(writeFileAction(baseDir, key)),
              E.getOrElseW(logErrorAction),
              A.of
            ),
            nested: flow(
              (_) => _.content,
              writeFileDictToActions(`${baseDir}/${key}`)
            ),
            string: flow((_) => _.content, writeFileAction(baseDir, key), A.of),
          })
        )
      )
    );

/**
 *
 */
export const tsconfig = pipe(
  {
    compilerOptions: {
      allowJs: true,
      declaration: true,
      declarationMap: true,
      esModuleInterop: true,
      exactOptionalPropertyTypes: true,
      forceConsistentCasingInFileNames: true,
      incremental: true,
      isolatedModules: true,
      jsx: 'preserve',
      lib: ['dom', 'dom.iterable', 'esnext'],
      module: 'esnext',
      moduleResolution: 'node',
      noEmit: true,
      noFallthroughCasesInSwitch: true,
      noImplicitReturns: true,
      noPropertyAccessFromIndexSignature: true,
      noUncheckedIndexedAccess: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      resolveJsonModule: true,
      skipLibCheck: true,
      sourceMap: true,
      strict: true,
      target: 'es5',
    },
    exclude: ['node_modules'],
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
  },
  jsonFileEntry
);

/**
 *
 */
export const packageJson = (projectId: string) =>
  pipe(
    {
      dependencies: {
        'babel-plugin-istanbul': '^6.1.1',
        'firebase-admin': '^10.0.0',
        'firebase-functions': '^3.15.7',
        masmott: 'file:./../../packages/masmott',
        next: '^12.0.1',
        react: '17.0.2',
        'react-dom': '^17.0.2',
      },
      devDependencies: {
        '@cypress/code-coverage': '^3.9.11',
        '@next/bundle-analyzer': '^12.0.1',
        '@types/react': '17.0.32',
        'cross-env': '^7.0.3',
        cypress: '^8.6.0',
        eslint: '7',
        'eslint-config-masmott': 'file:./../../packages/eslint-config-masmott',
        typescript: '4.4.4',
      },
      engines: {
        node: '14',
      },
      eslintConfig: {
        extends: 'masmott',
      },
      main: '.functions/index.js',
      name: projectId,
      private: true,
      scripts: {
        analyze: 'cross-env ANALYZE=true next build',
        build: 'yarn client:build && yarn server:build',
        'clean-coverage': 'rm -rf .nyc_output && rm -rf coverage',
        cli: 'node node_modules/masmott/dist/cjs/cli/index.js',
        'client:build': 'rm -rf .next && next build',
        'client:dev': 'next dev',
        lint: 'eslint ./ --ext ts,tsx',
        'server:build': 'node compiler.js',
        'server:dev': 'yarn server:build && yarn server:dev:cached',
        'server:dev:cached': 'firebase emulators:start',
        start: 'yarn build && yarn start:cached',
        'start:cached': 'firebase emulators:start',
        test: 'yarn build && yarn test:cached',
        'test:cached':
          'yarn clean-coverage && firebase emulators:exec "cypress run"',
        'test:gui': 'yarn build && yarn test:gui:cached',
        'test:gui:cached':
          'yarn clean-coverage' +
          ' && firebase emulators:exec "cypress run --headed"',
        'test:open': 'yarn build && yarn test:open:cached',
        'test:open:cached': 'firebase emulators:exec "cypress open"',
      },
      version: '0.1.0',
    },
    jsonFileEntry
  );

/**
 *
 */
export const generateCmdActions = (config: MasmottConfig): WriteFileDict => {
  console.log(config);
  return {
    // '.babelrc': babelrc,
    // cypress: {
    //   plugins: {
    //     'index.js': cypressPlugins,
    //   },
    //   support: {
    //     'index.js': cypressSupport,
    //   },
    //   'tsconfig.json': cypressTsconfig, // },
    // 'cypress.json': cypress,
    // 'firebase.json': firebaseJson,
    // 'firestore.indexes.json': firestoreIndexJson,
    // 'firestore.rules': firestoreRules,
    // 'masmott.ts': makeClientStr(config),
    // 'next-env.d.ts': nextEnv,
    // 'next.config.js': nextConfig,
    'package.json': packageJson(config.firebase.projectId),
    // pages: {
    //   api: {
    //     '__coverage__.js': apiCoverage,
    //   },
    // },
    'tsconfig.json': tsconfig,
  };
};

/**
 *
 */
export const reportIfLeft = <A>(validation: Validation<A>) =>
  pipe(
    validation,
    E.mapLeft(() => PathReporter.report(validation))
  );

/**
 *
 */
export const configToAction = flow(
  E.chain(YAML.load),
  E.chainW(flow(MasmottConfig.decode, reportIfLeft)),
  E.map(flow(generateCmdActions, writeFileDictToActions('.')))
);
