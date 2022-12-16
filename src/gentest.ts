/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable functional/no-expression-statement */
import * as fs from 'fs/promises';

const main = async () => {
  await fs.writeFile('test/tests.ts', `const aabccd = '';`);
};

main();
