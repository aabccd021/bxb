/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import { Masmott } from 'core';
import * as fs from 'fs';

export const generate = (masmott: Masmott) => {
  console.log(`Start generate`);
  fs.writeFileSync('a.txt', masmott.firebase.projectId);
  console.log(`Finish generate`);
};
