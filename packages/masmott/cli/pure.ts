import { Validation } from 'io-ts';
import * as yaml from 'js-yaml';
import { getClientStr } from './client';
import { MasmottConfig, WriteFileDict } from './types';

function jsonStringify(object: unknown): string {
  return JSON.stringify(object, undefined, 2);
}

const firebaseJson = jsonStringify({
  emulators: {
    firestore: {
      port: 8080,
    },
    hosting: {
      port: 5000,
    },
    ui: {
      enabled: true,
    },
    auth: {
      port: 9099,
    },
    functions: {
      port: 5001,
    },
    storage: {
      port: 9199,
    },
  },
  firestore: {
    rules: 'firestore.rules',
    indexes: 'firestore.indexes.json',
  },
  functions: {
    source: '.',
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
  },
  hosting: [
    {
      public: 'public',
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
      rewrites: [
        {
          source: '**',
          function: 'nextjs',
        },
      ],
    },
  ],
});

const cypress = jsonStringify({
  baseUrl: 'http://localhost:5000',
  video: false,
  env: {
    codeCoverage: {
      url: '/api/__coverage__',
    },
  },
});

const firestoreIndexJson = jsonStringify({
  indexes: [],
  fieldOverrides: [],
});

const babelrc = jsonStringify({
  presets: ['next/babel'],
  plugins: ['istanbul'],
});

const firestoreRules = `
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // This rule allows anyone with your database reference to view, edit,
      // and delete all data in your database. It is useful for getting
      // started, but it is configured to expire after 30 days because it
      // leaves your app open to attackers. At that time, all client 
      // requests to your database will be denied.  
      // Make sure to write security rules for your app before that time, or //
      // else all client requests to your database will be denied until you 
      // update your rules.  allow read, write: if request.time <
      // timestamp.date(2021, 11, 16);
     }
  }
}
`;

const nextEnv = `
/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;

const nextConfig = `{
  reactStrictMode: true,
  redirects: () => {
    return [
      {
        source: '/',
        destination: '/thread/new',
        permanent: false,
      },
    ];
  },
}`;

const cypressPlugins = `
module.exports = (on, config) => {
	require('@cypress/code-coverage/task')(on, config)
	// IMPORTANT to return the config object
	// with the any changed environment variables
	return config
}
`;

const cypressSupport = `import '@cypress/code-coverage/support';`;

const cypressTsconfig = jsonStringify({
  compilerOptions: {
    target: 'es5',
    lib: ['es5', 'dom'],
    types: ['cypress'],
  },
  include: ['**/*.ts'],
});

const apiCoverage = `/* istanbul ignore file */
module.exports = require('@cypress/code-coverage/middleware/nextjs')`;

// function pageId(): string {
//   return `/* istanbul ignore file */
// import { makeISRPage, ViewPath } from 'masmott';
// import { makeGetStaticPaths, makeGetStaticProps } from 'masmott/server';
// import { options, ThreadPageData } from '../../generated';
// import Page from '../../web/thread/[id]';
// const viewPath: ViewPath = ['thread', 'page'];
// const ISRPage = makeISRPage<ThreadPageData>(options, viewPath, Page);
// export default ISRPage;
// export const getStaticPaths = makeGetStaticPaths();
// export const getStaticProps = makeGetStaticProps(viewPath);`;
// }

// function page(): string {
//   return `/* istanbul ignore file */
// import Page from '../../web/thread/new';

// export default Page;`;
// }

function packageJson(projectId: string): string {
  const packageJsonContent = {
    name: projectId,
    version: '0.1.0',
    private: true,
    engines: {
      node: '14',
    },
    main: '.functions/index.js',
    scripts: {
      cli: 'node node_modules/masmott/bin/cli/index.js',
      lint: 'eslint ./ --ext ts,tsx',
      'clean-coverage': 'rm -rf .nyc_output && rm -rf coverage',
      'server:build': 'node compiler.js',
      'client:build': 'rm -rf .next && next build',
      build: 'yarn client:build && yarn server:build',
      'start:cached': 'firebase emulators:start',
      start: 'yarn build && yarn start:cached',
      'test:cached': 'yarn clean-coverage && firebase emulators:exec "cypress run"',
      test: 'yarn build && yarn test:cached',
      'test:gui:cached': 'yarn clean-coverage && firebase emulators:exec "cypress run --headed"',
      'test:gui': 'yarn build && yarn test:gui:cached',
      'test:open:cached': 'firebase emulators:exec "cypress open"',
      'test:open': 'yarn build && yarn test:open:cached',
      'server:dev:cached': 'firebase emulators:start',
      'server:dev': 'yarn server:build && yarn server:dev:cached',
      'client:dev': 'next dev',
      analyze: 'cross-env ANALYZE=true next build',
    },
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
    eslintConfig: {
      extends: 'masmott',
    },
  };

  return jsonStringify(packageJsonContent);
}

const tsconfig = jsonStringify({
  compilerOptions: {
    target: 'es5',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'node',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    noUncheckedIndexedAccess: true,
    noPropertyAccessFromIndexSignature: true,
    exactOptionalPropertyTypes: true,
    noImplicitReturns: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
    sourceMap: true,
    declaration: true,
    declarationMap: true,
    incremental: true,
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
  exclude: ['node_modules'],
});

export function parseMasmottConfig(configStr: string): Validation<MasmottConfig> {
  const unsafeSpecData = yaml.load(configStr);
  const decodeResult = MasmottConfig.decode(unsafeSpecData);
  return decodeResult;
}

export function getWriteFileDict(config: MasmottConfig): WriteFileDict {
  return {
    'masmott.ts': getClientStr(config),
    'tsconfig.json': tsconfig,
    'package.json': packageJson(config.firebase.projectId),
    'firebase.json': firebaseJson,
    'cypress.json': cypress,
    'firestore.indexes.json': firestoreIndexJson,
    'firestore.rules': firestoreRules,
    '.babelrc': babelrc,
    'next-env.d.ts': nextEnv,
    'next.config.js': nextConfig,
    cypress: {
      'tsconfig.json': cypressTsconfig,
      plugins: {
        'index.js': cypressPlugins,
      },
      support: {
        'index.js': cypressSupport,
      },
    },
    pages: {
      api: {
        '__coverage__.js': apiCoverage,
      },
    },
  };
}
