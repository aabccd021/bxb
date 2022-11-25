/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';
import { option, readonlyArray, readonlyRecord } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import * as fs from 'fs';
import * as path from 'path';

const { summon } = summonFor({});

const PackageJson = summon((F) =>
  F.interface(
    {
      dependencies: F.strMap(F.string()),
    },
    'PackageJson'
  )
);

const envStr = (provider: string) => `
import { mkClientEnv } from '${provider}';
import { adaptClientEnv } from 'masmott';
import { clientConfig } from '../${provider}.config'
export const env = adaptClientEnv(mkClientEnv(), clientConfig);
`;

const methodStr = (scope: string, method: string, provider: string) => `
import {stack as providerStack} from '${provider}';
import {env as providerEnv} from '../provider-env';
import {stack as mockStack} from 'masmott';
import {env as mockEnv} from '../mock-env';

export const ${method} =
  process.env.NODE_ENV === 'production' 
    ? providerStack.client.${scope}.${method}(providerEnv)
    : mockStack.client.${scope}.${method}(mockEnv);
`;

const scopes = {
  auth: [
    'signInWithGoogleRedirect',
    'onAuthStateChanged',
    'signOut',
    'createUserAndSignInWithEmailAndPassword',
  ],
  db: ['setDoc', 'getDoc'],
  storage: ['uploadDataUrl', 'getDownloadUrl'],
};

const provider = pipe(
  fs.readFileSync('package.json', { encoding: 'utf8' }),
  JSON.parse,
  PackageJson.type.decode,
  option.fromEither,
  option.map((p) => p.dependencies),
  option.chain(
    flow(
      readonlyRecord.keys,
      readonlyArray.filter((dep) => dep.startsWith('masmott-')),
      readonlyArray.head
    )
  )
);

if (option.isNone(provider)) {
  throw Error('No provider found');
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

fs.writeFileSync('masmott/provider-env.ts', envStr(`${provider.value}`));
fs.writeFileSync('masmott/mock-env.ts', envStr('masmott'));

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
