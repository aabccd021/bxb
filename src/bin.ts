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

const methodStr = (scope: string, method: string, provider: string) => `
import { stack as providerStack } from '${provider}';
import { stack as mockStack } from 'masmott';

import { clientEnv as providerClientEnv } from '../../${provider}.config'
import { clientEnv as mockClientEnv } from '../../masmott.config'

export const ${method} = process.env.NODE_ENV === 'production' 
    ? providerStack.client.${scope}.${method}(providerClientEnv)
    : mockStack.client.${scope}.${method}(mockClientEnv);
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
