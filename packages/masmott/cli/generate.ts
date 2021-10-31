#!/usr/bin/env node

import { isLeft } from 'fp-ts/lib/Either';
import * as fs from 'fs';
import { PathReporter } from 'io-ts/PathReporter';
import { getClientStr } from './client';
import { parseMasmottConfig } from './parse';

export function generate(): void {
  const configStr = fs.readFileSync('./masmott.yaml', { encoding: 'utf-8' });

  const parseResult = parseMasmottConfig(configStr);

  if (isLeft(parseResult)) {
    throw Error(PathReporter.report(parseResult)[0]);
  }

  const config = parseResult.right;

  fs.writeFileSync('masmott.ts', getClientStr(config));
}
