/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */

import { Masmott } from 'core';
import * as fs from 'fs';

import { compile } from './compile';
import { runCmd } from './runCmd';

export const compileAndGenerate = async () => {
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
  console.log(`Finish compile and generate`);
  return exitCode;
};

export const generate = (masmott: Masmott) => {
  console.log(`Start generate`);
  fs.writeFileSync('a.txt', masmott.firebase.projectId);
  console.log(`Finish generate`);
};
