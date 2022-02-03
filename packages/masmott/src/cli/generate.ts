/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import { Dict, Masmott } from 'core';
import * as fs from 'fs';

import { cypressJson, nextConfigJs, nextEnvDTs } from './templates';
import { firebaseJson } from './templates/firebase-json';

type Dir = Dict<string | Dir>;

const toPathArray = (dir: Dir, parent?: string): readonly (readonly [string, string])[] =>
  Object.entries(dir).flatMap(([name, content]) => {
    const absName = `${parent ?? '.'}/${name}`;
    return typeof content === 'string' ? [[absName, content]] : toPathArray(content, absName);
  });

const write = (dir: Dir) =>
  toPathArray(dir).forEach(([path, content]) => {
    console.log(`Generating ${path}`);
    fs.rmSync(path, { force: true });
    fs.writeFileSync(path, content);
  });

export const generate = (_masmott: Masmott) => {
  write({
    'cypress.json': cypressJson,
    'next-env.d.ts': nextEnvDTs,
    'next.config.js': nextConfigJs,
  });
  const files = fs.readdirSync('.', { withFileTypes: true });
  write({
    'firebase.json': firebaseJson(files),
  });
};
