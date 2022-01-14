import { MasmottConfig } from '@core/type';
import * as Bool from 'fp-ts/boolean';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as Arr from 'fp-ts/ReadonlyArray';
import * as Rec from 'fp-ts/ReadonlyRecord';
import { Validation } from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { match } from 'ts-adt';

import * as J from './library/json';
import * as YAML from './library/yaml';
import {
  Action,
  CompilerOptions,
  EitherWriteFileEntry,
  GenerateCmdArgs,
  LogError,
  ModuleKind,
  ReadFile,
  ScriptTarget,
  WriteFileDict,
} from './type';

/**
 *
 */
export const logError = (errorDetail: unknown): LogError => ({
  _type: 'logError',
  errorDetail,
});

/**
 *
 */
export const logErrorUnknownCommand = flow(
  Arr.reduce('unknown command: ', (acc, el: string) => `${acc} ${el}`),
  logError
);

/**
 *
 */
export const rmdirIfTrue = (path: string) =>
  flow(
    Bool.match<Action>(
      () => ({ _type: 'doNothing' }),
      () => ({ _type: 'rm', options: { recursive: true }, path })
    ),
    Arr.of
  );

/**
 *
 */
export const mkdirIfFalse = (path: string) =>
  flow(
    Bool.match<Action>(
      () => ({ _type: 'mkdir', options: { recursive: true }, path }),
      () => ({ _type: 'doNothing' })
    ),
    Arr.of
  );

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
export const jsonFileEntry = flow(J.stringify(2), eitherWriteFileEntry);

/**
 *
 */
export const _mkdirAndWriteFile =
  (dir: string, name: string) =>
  (data: string): readonly Action[] =>
    [
      { _type: 'mkdirIfAbsent', path: dir },
      { _type: 'writeFile', data, path: `${dir}/${name}` },
    ];

/**
 *
 */
export const mkdirAndWriteFileDict =
  (baseDir: string) =>
  (dict: WriteFileDict): readonly Action[] =>
    pipe(
      dict,
      Rec.toReadonlyArray,
      Arr.chain(([key, value]) =>
        pipe(
          value,
          match({
            either: ({ content }) =>
              pipe(
                content,
                E.map(_mkdirAndWriteFile(baseDir, key)),
                E.getOrElseW(flow(logError, Arr.of))
              ),
            nested: flow(
              (_) => _.content,
              mkdirAndWriteFileDict(`${baseDir}/${key}`)
            ),
            string: flow((_) => _.content, _mkdirAndWriteFile(baseDir, key)),
          })
        )
      ),
      Arr.append<Action>({ _type: 'exec', command: '' })
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

export const firebaseJson = pipe(
  {
    emulators: {
      auth: {
        port: 9099,
      },
      firestore: {
        port: 8080,
      },
      functions: {
        port: 5001,
      },
      hosting: {
        port: 5000,
      },
      storage: {
        port: 9199,
      },
      ui: {
        enabled: true,
      },
    },
    firestore: {
      indexes: 'firestore.indexes.json',
      rules: 'firestore.rules',
    },
    functions: {
      ignore: [
        'firebase.json',
        'firbease-debug.log',
        '**/.*',
        '**/node_modules/**',
        'pages/**',
        'public/**',
        'firestore.rules',
        'README.md',
      ],
      source: '.',
    },
    hosting: [
      {
        cleanUrls: true,
        ignore: [
          'firebase.json',
          'firestore.indexes.json',
          'firestore.rules',
          'storage.rules',
          'remoteconfig.template.json',
          'tsconfig.json',
          'tsconfig.functions.json',
          'README.md',
          '**/node_modules/**',
          '.github/**',
          '.firebase/**',
          'pages/**',
        ],
        public: 'public',
        rewrites: [
          {
            function: 'nextjs',
            source: '**',
          },
        ],
      },
    ],
  },
  jsonFileEntry
);

/**
 *
 */
export const generateCmdActions = (config: MasmottConfig): WriteFileDict => ({
  // '.babelrc': babelrc,
  //   plugins: {
  //     'index.js': cypressPlugins,
  //   },
  //   support: {
  //     'index.js': cypressSupport,
  //   },
  //   'tsconfig.json': cypressTsconfig,
  // },
  // 'cypress.json': cypress,
  'firebase.json': firebaseJson,
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
});

/**
 *
 */
export const reportIfLeft = <A>(
  validation: Validation<A>
): E.Either<readonly string[], A> =>
  pipe(
    validation,
    E.mapLeft(() => PathReporter.report(validation))
  );

export const readMasmottConfigFile: ReadFile = {
  _type: 'readFile',
  options: { encoding: 'utf-8' },
  path: './masmott.yaml',
};

/**
 *
 */
export const logOnParseError = <A>(
  f: (a: A) => readonly Action[]
): ((e: E.Either<unknown, A>) => readonly Action[]) =>
  flow(E.map(f), E.getOrElseW(flow(logError, Arr.of)));

/**
 *
 */
export const generateFromConfig = flow(
  generateCmdActions,
  mkdirAndWriteFileDict('.')
);

/**
 *
 */
export const generate = (_: GenerateCmdArgs) =>
  pipe(generateFromConfig, logOnParseError);

/**
 *
 */
export const functionsIndexTs = (_: MasmottConfig) => ``;

/**
 *
 */
export const serverOutDir = '.functions';

/**
 *
 */
export const serverIndexFileName = 'index.ts';

/**
 *
 */
export const serverScriptTarget = ScriptTarget.ES2017;

/**
 *
 */
export const serverCompileOptions: CompilerOptions = {
  allowJs: true,
  esModuleInterop: true,
  module: ModuleKind.CommonJS,
  noImplicitReturns: true,
  noUnusedLocals: true,
  outDir: serverOutDir,
  skipLibCheck: true,
  sourceMap: true,
  strict: true,
  target: serverScriptTarget,
};

/**
 *
 */
export const equals =
  <A>(a1: A) =>
  (a2: A) =>
    a1 === a2;

/**
 *
 */
export const compileServerFromConfig = (
  _: MasmottConfig
): readonly Action[] => [
  {
    _type: 'rmdirIfExists',
    path: serverOutDir,
  },
  {
    _type: 'emitProgram',
    getSourceFile: flow(
      O.fromPredicate(equals(serverIndexFileName)),
      O.map((fileName) => ({
        content: '',
        fileName,
        target: serverScriptTarget,
      }))
    ),
    options: serverCompileOptions,
    rootNames: [serverIndexFileName],
  },
];

/**
 *
 */
export const compileServer = pipe(compileServerFromConfig, logOnParseError);

/**
 *
 */
export const doCmd = (_: { readonly args: readonly string[] }) =>
  pipe(
    E.chain(YAML.load),
    E.chainW(flow(MasmottConfig.decode, reportIfLeft)),
    () => []
  );
