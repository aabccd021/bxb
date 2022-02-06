import { jsonStringify } from './utils';

export const cypressJson = jsonStringify({
  baseUrl: 'http://localhost:5000',
});

export const nextEnvDTs = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;

export const nextConfigJs = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`;

export const tsConfigJson = jsonStringify({
  compilerOptions: {
    allowJs: true,
    alwaysStrict: true,
    baseUrl: '.',
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
    noImplicitAny: true,
    noImplicitOverride: true,
    noImplicitReturns: true,
    noImplicitThis: true,
    noPropertyAccessFromIndexSignature: true,
    noUncheckedIndexedAccess: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    paths: {
      '@masmott': ['.masmott/ts/index.ts'],
      '@masmottConfig': ['masmott.config.ts'],
      '@web/*': ['web/*'],
    },
    resolveJsonModule: true,
    skipLibCheck: true,
    strict: true,
    strictBindCallApply: true,
    strictFunctionTypes: true,
    strictNullChecks: true,
    strictPropertyInitialization: true,
    target: 'es5',
    types: ['jest'],
    useUnknownInCatchVariables: true,
  },
  exclude: ['node_modules'],
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
});

export const gitignore = `.masmott
.next
cypress.json
cypress/screenshots
cypress/videos
firebase.json
masmott.generated
next-env.d.ts
next.config.js
node_modules
pages
tsconfig.json
`;

export const packageJson = jsonStringify({
  dependencies: {
    'firebase-admin': '^10.0.2',
    'firebase-functions': '^3.17.1',
    masmott: '../../packages/masmott',
    next: '^12.0.1',
    react: '17.0.2',
    'react-dom': '^17.0.2',
  },
  devDependencies: {
    '@types/jest': '^27.4.0',
    '@types/react': '17.0.32',
    cypress: '^9.4.1',
    eslint: '^8.8.0',
    'eslint-config-masmott': '../../packages/eslint-config-masmott',
    'firebase-tools': '^10.1.2',
    jest: '^27.4.7',
    prettier: '^2.5.1',
    'ts-jest': '^27.1.3',
    typescript: '^4.5.5',
  },
  engines: {
    node: '16',
  },
  eslintConfig: {
    extends: 'masmott',
  },
  jest: {
    preset: 'ts-jest',
    testMatch: ['test/**/*.test.ts'],
  },
  main: '.masmott/functions/index.js',
  name: 'demo-diary',
  private: true,
  scripts: {
    build: 'masmott build',
    lint: 'masmott lint',
    start: 'masmott start',
    test: 'masmott test',
  },
  version: '0.1.0',
});
