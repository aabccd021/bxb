/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { pipe } from 'fp-ts/function';
import * as fs from 'fs';
import * as path from 'path';

export const methodStr = (scope: string, method: string, provider: string) => `
import {stack as mockStack} from 'masmott/dist/es6/browser';
import {stack as providerStack} from 'masmott-${provider}';

export const ${method} =
  process.env.NODE_ENV === 'production' 
    ? providerStack.client.${scope}.${method} 
    : mockStack.client.${scope}.${method};
`;

const idx = `export * as masmott from './masmott'`;

const masmott = (scopes: readonly string[]) =>
  scopes.map((scope) => `export * as ${scope} from './${scope}'`).join('\n');

const packageJson = `{
  "sideEffects": false
}`;

const scopes = {
  auth: ['signInGoogleWithRedirect', 'onAuthStateChanged', 'signOut'],
};

const dependencies = pipe(
  fs.readFileSync('package.json', { encoding: 'utf8' }),
  JSON.parse,
  (a) => a.dependencies
);

if (typeof dependencies !== 'object') {
  throw Error('');
}

const provider = Object.keys(dependencies)
  .filter((dep) => dep.startsWith('masmott-'))[0]
  ?.replace('masmott-', '');

if (provider === undefined) {
  throw Error('');
}

fs.rmSync('masmott', { force: true, recursive: true });
fs.mkdirSync('masmott');

fs.writeFileSync('masmott/index.ts', idx);
fs.writeFileSync('masmott/masmott.ts', masmott(Object.keys(scopes)));
fs.writeFileSync('masmott/package.json', packageJson);

Object.entries(scopes).forEach(([scope, methods]) => {
  fs.mkdirSync(`masmott/${scope}`);
  fs.writeFileSync(
    `masmott/${scope}/index.ts`,
    methods.map((method) => `export * from './${method}'`).join('\n')
  );
  methods.forEach((method) =>
    fs.writeFileSync(`masmott/${scope}/${method}.ts`, methodStr(scope, method, provider))
  );
});

fs.rmSync('public/masmott', { force: true, recursive: true });
fs.mkdirSync('public/masmott', { recursive: true });

fs.copyFileSync(
  path.join(__dirname, '..', '..', 'public', 'signInWithRedirect.html'),
  'public/masmott/signInWithRedirect.html'
);
