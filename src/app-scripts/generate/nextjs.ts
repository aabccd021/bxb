/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import * as fs from 'fs';

const methodStr = (scope: string, method: string, provider1: string, provider2: string) => `
import { stack as provider1Stack } from '${provider1}';
import { stack as provider2Stack } from '${provider2}';

import { clientEnv as provider1ClientEnv } from '../../${provider1}.config'
import { clientEnv as provider2ClientEnv } from '../../${provider2}.config'

export const ${method} = process.env.NODE_ENV === 'production' 
    ? provider1Stack.client.${scope}.${method}(provider1ClientEnv)
    : provider2Stack.client.${scope}.${method}(provider2ClientEnv)
`;

export const main = () => {
  const scopes = { a: ['a'] };
  fs.rmSync('bxb', { force: true, recursive: true });
  fs.mkdirSync('bxb');

  fs.writeFileSync('bxb/index.ts', `export * as bxb from './bxb'`);

  fs.writeFileSync(
    'bxb/bxb.ts',
    Object.keys(scopes)
      .map((scope) => `export * as ${scope} from './${scope}'`)
      .join('\n')
  );

  fs.writeFileSync(
    'bxb/package.json',
    `{  "sideEffects": false
}`
  );

  Object.entries(scopes).forEach(([scope, methods]) => {
    fs.mkdirSync(`bxb/${scope}`);
    fs.writeFileSync(
      `bxb/${scope}/index.ts`,
      methods.map((method) => `export * from './${method}'`).join('\n')
    );
    methods.forEach((method) =>
      fs.writeFileSync(`bxb/${scope}/${method}.ts`, methodStr(scope, method, '', ''))
    );
  });
};
