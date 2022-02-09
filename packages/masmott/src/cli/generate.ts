/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import { Dict, Masmott } from 'core';
import * as fs from 'fs';

import { lintCli } from './lint';
import { runCmd } from './runCmd';
import {
  cypressJson,
  cypressTsConfigJson,
  gitignore,
  integrationIndexSpec,
  nextConfigJs,
  nextEnvDTs,
  tsConfigJson,
  webHelloWorld,
} from './templates';
import { firebaseJson } from './templates/firebase-json';
import { overwritePackageJson } from './templates/package-json';
import { getPagesPaths } from './templates/pages';
import { rules } from './templates/rules';
import { hooksStr } from './templates/ts';
import { jsonStringify } from './templates/utils';
import { validate } from './validate';
import { write } from './write';

type Dir = Dict<string | Dir>;

const toPathArray = (dir: Dir, parent?: string): readonly (readonly [string, string])[] =>
  Object.entries(dir).flatMap(([name, content]) => {
    const absName = `${parent ?? '.'}/${name}`;
    return typeof content === 'string' ? [[absName, content]] : toPathArray(content, absName);
  });

const readDirRec = (dir: string): readonly string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((file) =>
      file.isDirectory() ? readDirRec(`${dir}/${file.name}`) : [`${dir}/${file.name}`]
    );

export const generate = async (masmott: Masmott) => {
  validate(masmott);
  const pagesDirName = './pages';
  if (fs.existsSync(pagesDirName)) {
    fs.rmSync(pagesDirName, { recursive: true });
  }
  write({
    paths: [['web/index.tsx', webHelloWorld]],
  });
  const webPagesRec = readDirRec('web');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const packageJson = JSON.parse(fs.readFileSync(`package.json`, { encoding: 'utf-8' }));
  write({ paths: [['cypress/integration/index.spec.ts', integrationIndexSpec]] });
  const staticPaths = toPathArray({
    '.gitignore': gitignore,
    '.masmott': {
      firestore: {
        'firestore.rules': rules(masmott),
      },
      'package.json': jsonStringify(overwritePackageJson(packageJson)),
      ts: {
        'index.ts': hooksStr(masmott.spec, webPagesRec),
      },
    },
    cypress: {
      'tsconfig.json': cypressTsConfigJson,
    },
    'cypress.json': cypressJson,
    'next-env.d.ts': nextEnvDTs,
    'next.config.js': nextConfigJs,
    'tsconfig.json': tsConfigJson,
  });
  write({ replace: true, paths: [...staticPaths, ...getPagesPaths(masmott, webPagesRec)] });
  const cwd = fs.readdirSync('.', { withFileTypes: true });
  write({
    replace: true,
    paths: toPathArray({
      'firebase.json': firebaseJson(cwd),
    }),
  });
  await runCmd('yarn eslint ./.masmott/ts --fix', { log: false });
  return lintCli(['--fix']);
};
