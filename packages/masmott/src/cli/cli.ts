#!/usr/bin/env node
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { build } from './build';
import { compileAndGenerate } from './generate';
import { test } from './test';

const cli = async (): Promise<number | undefined> => {
  const args = process.argv.slice(2);

  if (args[0] === 'build') {
    return build();
  }

  if (args[0] === 'test') {
    return test();
  }

  if (args[0] === 'generate') {
    return compileAndGenerate();
  }

  console.log('unknown command');
  return 0;
};

void cli().then(process.exit);
