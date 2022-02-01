#!/usr/bin/env node
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { build } from './build';
import { compileAndGenerate } from './generate';
import { test } from './test';

const main = async () => {
  const args = process.argv.slice(2);

  if (args[0] === 'build') {
    await build();
  }

  if (args[0] === 'test') {
    await test();
  }

  if (args[0] === 'generate') {
    await compileAndGenerate();
  }
};

void main();
