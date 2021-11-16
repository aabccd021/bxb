import { exec } from 'child_process';
import { isLeft } from 'fp-ts/lib/Either';
import * as fs from 'fs';
import { PathReporter } from 'io-ts/PathReporter';
import { makeWriteFileActions, parseMasmottConfig } from './pure';
import { WriteFileAction } from './types';

function handleFileWriteAction({ dir, name, content }: WriteFileAction): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(`${dir}/${name}`, content);
}

export function generate(): void {
  const configStr = fs.readFileSync('./masmott.yaml', { encoding: 'utf-8' });
  const parseResult = parseMasmottConfig(configStr);
  if (isLeft(parseResult)) {
    throw Error(PathReporter.report(parseResult)[0]);
  }
  makeWriteFileActions(parseResult.right).forEach(handleFileWriteAction);
  exec('yarn lint --fix');
}
