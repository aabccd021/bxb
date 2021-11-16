import { exec } from 'child_process';
import { isLeft } from 'fp-ts/lib/Either';
import * as fs from 'fs';
import { PathReporter } from 'io-ts/PathReporter';
import { makeWriteFileActions, parseMasmottConfig } from './pure';

export function generate(): void {
  const configStr = fs.readFileSync('./masmott.yaml', { encoding: 'utf-8' });
  const configParseResult = parseMasmottConfig(configStr);
  if (isLeft(configParseResult)) {
    throw Error(PathReporter.report(configParseResult)[0]);
  }
  const config = configParseResult.right;
  const writeFileActions = makeWriteFileActions(config);
  writeFileActions.forEach(({ dir, name, content }) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(`${dir}/${name}`, content);
  });
  exec('yarn lint --fix');
}
