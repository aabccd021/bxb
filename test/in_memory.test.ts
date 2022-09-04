import { makeClient } from '../src/in_memory';
import { makeTest, runTests } from '../src/test';

const inMemoryTests = makeTest(makeClient);

runTests(inMemoryTests);
