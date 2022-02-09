#!/usr/bin/env node
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { buildCli } from './build';
import { lintCli } from './lint';
import { startCli } from './start';
import { testCli } from './test';

const cli = async (): Promise<number | undefined> => {
  const [command, ...rest] = process.argv.slice(2);

  if (command === 'build') {
    return buildCli();
  }

  if (command === 'test') {
    return testCli(rest);
  }

  if (command === 'start') {
    return startCli(rest);
  }

  if (command === 'lint') {
    return lintCli(rest);
  }

  console.log('unknown command');
  return 0;
};

void cli().then(process.exit);
