/* eslint-disable functional/no-expression-statement */
import { tests } from 'masmott/dist/cjs/test';

import { mkClientEnv, stack } from '../src';

tests(stack, mkClientEnv);
