/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import { Dict, Masmott } from 'core';
import * as fs from 'fs';
import { dirname } from 'path';

import { cypressJson, gitignore, nextConfigJs, nextEnvDTs, tsConfigJson } from './templates';
import { firebaseJson } from './templates/firebase-json';
import { getPagesPaths } from './templates/pages';

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

export const generate = (masmott: Masmott) => {
  const staticPaths = toPathArray({
    '.gitignore': gitignore,
    'cypress.json': cypressJson,
    'next-env.d.ts': nextEnvDTs,
    'next.config.js': nextConfigJs,
    'tsconfig.json': tsConfigJson,
  });
  write([...staticPaths, ...getPagesPaths(masmott)]);
  write(
    toPathArray({
      'firebase.json': firebaseJson(),
    })
  );
};
