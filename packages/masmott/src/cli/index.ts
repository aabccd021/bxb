#!/usr/bin/env node
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { build } from './build';
import { test } from './test';

const args = process.argv.slice(2);

if (args[0] === 'build') {
  build();
}

if (args[0] === 'test') {
  test();
}
