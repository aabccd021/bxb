#!/usr/bin/env node
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { buildCli } from './build';
import { lintCli } from './lint';
import { startCli } from './start';
import { testCli } from './test';

const cli = async (): Promise<number | undefined> => {
  const args = process.argv.slice(2);

  if (args[0] === 'build') {
    return buildCli();
  }

  if (args[0] === 'test') {
    return testCli(args.slice(1));
  }

  if (args[0] === 'start') {
    return startCli(args.slice(1));
  }

  if (args[0] === 'lint') {
    return lintCli(args.slice(1));
  }

  console.log('unknown command');
  return 0;
};

void cli().then(process.exit);
