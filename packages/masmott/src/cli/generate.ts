/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import { Dict, Masmott } from 'core';
import * as fs from 'fs';
import { dirname } from 'path';
import { lintCli } from './lint';
import { runCmd } from './runCmd';
import { cypressJson, gitignore, nextConfigJs, nextEnvDTs, tsConfigJson } from './templates';
import { firebaseJson } from './templates/firebase-json';
import { getPagesPaths } from './templates/pages';
import { rules } from './templates/rules';
import { hooksStr } from './templates/ts';


type Dir = Dict<string | Dir>;

const toPathArray = (dir: Dir, parent?: string): readonly (readonly [string, string])[] =>
  Object.entries(dir).flatMap(([name, content]) => {
    const absName = `${parent ?? '.'}/${name}`;
    return typeof content === 'string' ? [[absName, content]] : toPathArray(content, absName);
  });

const write = (paths: readonly (readonly [string, string])[]) =>
  paths.forEach(([path, content]) => {
    console.log(`Generating ${path}`);
    const pathDirname = dirname(path);
    if (!fs.existsSync(pathDirname)) {
      fs.mkdirSync(pathDirname);
    }
    fs.rmSync(path, { force: true });
    fs.writeFileSync(path, content, {});
  });

const readDirRec = (dir: string): readonly string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((file) =>
      file.isDirectory() ? readDirRec(`${dir}/${file.name}`) : [`${dir}/${file.name}`]
    );

export const generate = async (masmott: Masmott) => {
  const pagesDirName = './pages';
  if (fs.existsSync(pagesDirName)) {
    fs.rmSync(pagesDirName, { recursive: true });
  }
  const cwd = fs.readdirSync('.', { withFileTypes: true });
  const webPagesRec = readDirRec('web');
  const staticPaths = toPathArray({
    '.gitignore': gitignore,
    '.masmott': {
      firestore: {
        'firestore.rules': rules(),
      },
      ts: {
        'index.ts': hooksStr(masmott.spec, webPagesRec),
      },
    },
    'cypress.json': cypressJson,
    'next-env.d.ts': nextEnvDTs,
    'next.config.js': nextConfigJs,
    'tsconfig.json': tsConfigJson,
  });
  write([...staticPaths, ...getPagesPaths(masmott, webPagesRec)]);
  write(
    toPathArray({
      'firebase.json': firebaseJson(cwd),
    })
  );
  const exitCode1 = await runCmd('yarn eslint ./.masmott/ts --fix');
  if (exitCode1 !== 0) {
    return exitCode1;
  }
  return lintCli(['--fix']);
};
