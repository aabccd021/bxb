import { mkClientEnv, stack } from '../src';
import { tests } from '../src/test';

tests(stack, mkClientEnv, undefined);
