import { taskEither } from 'fp-ts';
import { runTests } from 'masmott/dist/cjs/test';

import { stack } from '../src';

runTests(stack, taskEither.right(undefined));
