/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import * as fs from 'fs';
import { dirname } from 'path';

export const write = ({
  paths,
  replace,
}: {
  readonly paths: readonly (readonly [string, string])[];
  readonly replace?: boolean;
}) =>
  paths.forEach(([path, content]) => {
    console.log(`Generating ${path}`);
    const pathDirname = dirname(path);
    if (!fs.existsSync(pathDirname)) {
      fs.mkdirSync(pathDirname, { recursive: true });
    }
    const finalReplace = replace ?? false;
    if (finalReplace && fs.existsSync(path)) {
      fs.rmSync(path, { force: true });
    }
    fs.writeFileSync(path, content, {});
  });
