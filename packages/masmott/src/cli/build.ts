/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
// eslint-disable-next-line functional/no-return-void

import { existsSync, rmSync } from 'fs';

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

  if (existsSync(outdir)) {
    rmSync(outdir, { recursive: true });
  }

  compile(outdir, { 'index.ts': indexContent });
  console.log('Finish build functions');
};

const buildNext = async () => {
  console.log('Start build next');
  const nextdir = '.next';

  if (existsSync(nextdir)) {
    rmSync(nextdir, { recursive: true });
  }

  const exitCode = await runCmd('next build');
  console.log('Finish build next');
  return exitCode;
};

export const build = async () => {
  console.log('Start build');
  buildFunctions();
  const exitCode = await buildNext();
  console.log(`Finish build`);
  return exitCode;
};
