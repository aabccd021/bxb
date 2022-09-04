import { runTests } from 'unit-test-ts';
import { expect, it } from 'vitest';

import { makeClient } from '../src/in_memory';
import { makeTests } from '../src/test';

const inMemoryTests = makeTests(makeClient);

runTests(inMemoryTests, expect, it);
