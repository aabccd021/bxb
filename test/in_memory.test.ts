import { describe, expect, it } from 'vitest';

import { makeClientWithConfig } from '../src/in_memory';
import { makeTest } from '../src/test';

Object.entries(makeTest(makeClientWithConfig)).forEach(([describeName, tests]) =>
  describe(describeName, () => {
    Object.entries(tests).forEach(([testName, { expect: actual, toStrictEqual: expected }]) =>
      it(testName, () => expect(actual()).resolves.toStrictEqual(expected))
    );
  })
);
