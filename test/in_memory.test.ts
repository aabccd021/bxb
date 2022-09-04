import { describe, expect, it } from 'vitest';

import { makeClient } from '../src/in_memory';
import { makeTest } from '../src/test';

Object.entries(makeTest(makeClient)).forEach(([describeName, tests]) =>
  describe(describeName, () => {
    Object.entries(tests).forEach(([testName, { expect: actual, toStrictEqual: expected }]) =>
      it(testName, () => expect(actual()).resolves.toStrictEqual(expected))
    );
  })
);
