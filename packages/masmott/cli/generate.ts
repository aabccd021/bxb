#!/usr/bin/env node

import { isLeft } from 'fp-ts/lib/Either';
import * as fs from 'fs';
import { PathReporter } from 'io-ts/PathReporter';
import { forEach } from 'lodash';
import { getWriteFileDict, parseMasmottConfig } from './pure';
import { WriteFileDict } from './types';

function writeFiles(writeFileDict: WriteFileDict, cwd: string): void {
  forEach(writeFileDict, (content, name) => {
    const path = `${cwd}/${name}`;
    if (typeof content === 'string') {
      if (!fs.existsSync(cwd)) {
        fs.mkdirSync(cwd, { recursive: true });
      }
      fs.writeFileSync(path, content);
      return;
    }
    writeFiles(content, path);
  });
}

export function generate(): void {
  const configStr = fs.readFileSync('./masmott.yaml', { encoding: 'utf-8' });
  const parseResult = parseMasmottConfig(configStr);
  if (isLeft(parseResult)) {
    throw Error(PathReporter.report(parseResult)[0]);
  }
  writeFiles(getWriteFileDict(parseResult.right), '.');
}
