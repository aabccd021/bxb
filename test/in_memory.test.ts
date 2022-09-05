import { executeTests } from 'unit-test-ts';
import * as vitest from 'vitest';

import { makeClient } from '../src/in_memory';
import { makeTests } from '../src/test';

const inMemoryTests = makeTests(makeClient);

executeTests(inMemoryTests, vitest);
