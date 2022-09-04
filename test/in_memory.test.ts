import { runTests } from 'unit-test-ts';
import { expect, it } from 'vitest';

import { makeClient } from '../src/in_memory';
import { makeTest } from '../src/test';

const inMemoryTests = makeTest(makeClient);

runTests(inMemoryTests, expect, it);
