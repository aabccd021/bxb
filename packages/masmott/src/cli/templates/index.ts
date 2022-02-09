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
      '@migration/*': ['migration/*'],
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

export const cypressTsConfigJson = jsonStringify({
  compilerOptions: {
    lib: ['es5', 'dom'],
    target: 'es5',
    types: ['cypress'],
  },
  include: ['**/*.ts'],
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
tsconfig.tsbuildinfo
`;

export const integrationIndexSpec = `describe('hello', () => {
  it('world', () => {
    cy.visit('/');
  });
});
`;
