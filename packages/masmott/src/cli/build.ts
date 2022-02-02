/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
// eslint-disable-next-line functional/no-return-void

import * as fs from 'fs';

import { compile } from './compile';
import { runCmd } from './runCmd';

const buildFunctions = () => {
  console.log('Start build functions');
  const indexContent = `
import { initAndMakeFirestoreTriggers } from 'masmott';
import { masmott } from './masmott';
import conf from './next.config';

export const {firestore, nextjs} = initAndMakeFirestoreTriggers(masmott, conf);
`;

  const outdir = '.masmott/functions';

  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { recursive: true });
  }

  compile(outdir, { 'index.ts': indexContent });
  console.log('Finish build functions');
};

const buildNext = async () => {
  console.log('Start build next');
  const nextdir = '.next';

  if (fs.existsSync(nextdir)) {
    fs.rmSync(nextdir, { recursive: true });
  }

  const exitCode = await runCmd('next build');
  console.log('Finish build next');
  return exitCode;
};

const compileAndGenerate = async () => {
  console.log(`Start compile and generate`);
  const indexContent = `
import { generate } from 'masmott';
import { masmott } from './masmott';

generate(masmott);
`;

  const outdir = '.masmott/cli';

  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { recursive: true });
  }

  console.log(`Start compile generator`);
  compile(outdir, { 'index.ts': indexContent });
  console.log(`Finish compile generator`);

  const exitCode = await runCmd('node ./.masmott/cli/index.js');
  console.log(
    `Finish compile and generate with exit code: ${exitCode ?? 'unknown'}`
  );
  return exitCode;
};

export const build = async () => {
  console.log('Start build');
  const exit1 = await compileAndGenerate();
  if (exit1 !== 0) {
    return exit1;
  }
  buildFunctions();
  const exitCode = await buildNext();
  console.log(`Finish build`);
  return exitCode;
};
