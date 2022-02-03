/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import { Dict, Masmott } from 'core';
import * as fs from 'fs';

import { cypressJson, nextConfigJs, nextEnvDTs, tsConfigJson } from './templates';
import { firebaseJson } from './templates/firebase-json';
import { pages } from './templates/pages';

type Dir = Dict<string | Dir>;

const toPathArray = (dir: Dir, parent?: string): readonly (readonly [string, string])[] =>
  Object.entries(dir).flatMap(([name, content]) => {
    const absName = `${parent ?? '.'}/${name}`;
    return typeof content === 'string' ? [[absName, content]] : toPathArray(content, absName);
  });

const write = (paths: readonly (readonly [string, string])[]) =>
  paths.forEach(([path, content]) => {
    console.log(`Generating ${path}`);
    fs.rmSync(path, { force: true });
    fs.writeFileSync(path, content);
  });

export const generate = (masmott: Masmott) => {
  const staticPaths = toPathArray({
    'cypress.json': cypressJson,
    'next-env.d.ts': nextEnvDTs,
    'next.config.js': nextConfigJs,
    'tsconfig.json': tsConfigJson,
  });
  write([...staticPaths, ...pages(masmott)]);
  const files = fs.readdirSync('.', { withFileTypes: true });
  write(
    toPathArray({
      'firebase.json': firebaseJson(files),
    })
  );
};
