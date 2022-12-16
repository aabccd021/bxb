import { tests } from './tests';
import { runTest } from './util';

Object.entries(tests)
  .map(([name, test]) => ({ ...test, name, concurrent: true }))
  .forEach((test) => runTest({ test }));
