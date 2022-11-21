/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { option, readonlyArray, readonlyRecord, string } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import * as fs from 'fs';
import * as path from 'path';

const methodStr = (scope: string, method: string, provider: string) => `
import {stack as mockStack} from 'masmott/dist/es6/browser';
import {stack as providerStack} from 'masmott-${provider}';

export const ${method} =
  process.env.NODE_ENV === 'production' 
    ? providerStack.client.${scope}.${method} 
    : mockStack.client.${scope}.${method};
`;

const scopes = {
  auth: ['signInGoogleWithRedirect', 'onAuthStateChanged', 'signOut'],
};

const provider = pipe(
  fs.readFileSync('package.json', { encoding: 'utf8' }),
  JSON.parse,
  (a) => a.dependencies,
  option.fromPredicate((x) => typeof x === 'object'),
  option.chain(
    flow(
      readonlyRecord.keys,
      readonlyArray.filter((dep) => dep.startsWith('masmott-')),
      readonlyArray.head
    )
  ),
  option.map(string.replace('masmott-', ''))
);

if (option.isNone(provider)) {
  throw Error();
}

fs.rmSync('masmott', { force: true, recursive: true });
fs.mkdirSync('masmott');

fs.writeFileSync('masmott/index.ts', `export * as masmott from './masmott'`);

fs.writeFileSync(
  'masmott/masmott.ts',
  Object.keys(scopes)
    .map((scope) => `export * as ${scope} from './${scope}'`)
    .join('\n')
);

fs.writeFileSync(
  'masmott/package.json',
  `{
  "sideEffects": false
}`
);

Object.entries(scopes).forEach(([scope, methods]) => {
  fs.mkdirSync(`masmott/${scope}`);
  fs.writeFileSync(
    `masmott/${scope}/index.ts`,
    methods.map((method) => `export * from './${method}'`).join('\n')
  );
  methods.forEach((method) =>
    fs.writeFileSync(`masmott/${scope}/${method}.ts`, methodStr(scope, method, provider.value))
  );
});

fs.rmSync('public/masmott', { force: true, recursive: true });
fs.mkdirSync('public/masmott', { recursive: true });

fs.copyFileSync(
  path.join(__dirname, '..', '..', 'public', 'signInWithRedirect.html'),
  'public/masmott/signInWithRedirect.html'
);
