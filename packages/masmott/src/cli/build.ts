/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
// eslint-disable-next-line functional/no-return-void

import * as fs from 'fs';

import { compile, compileAndRunCLI } from './compile';
import { runCmd } from './runCmd';

const functionsCode = `
import { initAndMakeFirestoreTriggers, Masmott } from 'masmott';
import { masmott } from './masmott.config';
import conf from './next.config';

export const {firestore, nextjs} = initAndMakeFirestoreTriggers(masmott as Masmott, conf);
`;

const buildFunctions = () => compile('functions', 'index', functionsCode);

const buildNext = () => {
  fs.rmSync('.next', { force: true, recursive: true });
  return runCmd('next build');
};

export const buildCli = async () => {
  const exit1 = await compileAndRunCLI('generate');
  if (exit1 !== 0) {
    return exit1;
  }
  const exit2 = buildFunctions();
  if (exit2 !== 0) {
    return exit2;
  }
  return buildNext();
};
