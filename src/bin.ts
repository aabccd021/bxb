/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import * as fs from 'fs';
import * as path from 'path';

export const methodStr = (method: string, provider: string) => `
import * as mock from 'masmott/dist/es6/mock';
import * as impl from 'masmott-${provider}';

export const ${method} =
  process.env.NODE_ENV === 'production' ? impl.${method} : mock.${method};
`;

const idx = `export * as masmott from './masmott'`;

const masmott = (methods: readonly string[]) =>
  methods.map((method) => `export * from './${method}'`).join('\n');

const packageJson = `{
  "sideEffects": false
}`;

const methods = ['signIn'];

const provider = 'provider';

if (!fs.existsSync('masmott')) {
  fs.mkdirSync('masmott');
}

if (!fs.existsSync('public/masmott')) {
  fs.mkdirSync('public/masmott', { recursive: true });
}

fs.writeFileSync('masmott/index.ts', idx);
fs.writeFileSync('masmott/masmott.ts', masmott(methods));
fs.writeFileSync('masmott/package.json', packageJson);

methods.forEach((method) => fs.writeFileSync(`masmott/${method}.ts`, methodStr(method, provider)));

fs.copyFileSync(
  path.join(__dirname, '..', '..', 'public', 'signIn.html'),
  'public/masmott/signIn.html'
);