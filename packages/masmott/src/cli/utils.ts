/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import * as fs from 'fs';
import { dirname } from 'path';

export const write = ({
  paths,
  replace: _replace,
}: {
  readonly paths: readonly (readonly [string, string])[];
  readonly replace?: true;
}) =>
  paths.forEach(([path, content]) => {
    console.log(`Generating ${path}`);
    const pathDirname = dirname(path);
    if (!fs.existsSync(pathDirname)) {
      fs.mkdirSync(pathDirname, { recursive: true });
    }
    const replace = _replace ?? false;
    const isExists = fs.existsSync(path);
    if ((isExists && replace) || !isExists) {
      fs.writeFileSync(path, content, {});
    }
  });

export const defaultProjectId = process.cwd().split('/').at(-1) ?? '';
