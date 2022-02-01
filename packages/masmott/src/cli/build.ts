/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
// eslint-disable-next-line functional/no-return-void

import { existsSync, rmSync } from 'fs';

import { compile } from './compile';

export const build = () => {
  console.log('Start build');
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

  // const exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Finish build`);
};
