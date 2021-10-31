import isEqual from 'lodash/isEqual';
import { build } from './build';
import { generate } from './generate';

const args = process.argv.slice(2);

if (isEqual(args, ['generate'])) {
  generate();
}

if (isEqual(args, ['build'])) {
  build();
}

