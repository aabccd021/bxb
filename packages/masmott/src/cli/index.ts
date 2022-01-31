#!/usr/bin/env node
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { build } from './build';

const args = process.argv.slice(2);

if (args[0] === 'build') {
  build();
}

console.log('done dongs');
