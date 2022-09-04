import { option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { fail, pass, runTests, Tests } from 'unit-test-ts';
import { expect, it } from 'vitest';

import { getTextFromBlob, stringToBlob } from '../src/test';

const tests: Tests = {
  'wrap and extract returns original string': pass({
    expect: pipe('masumoto', stringToBlob, getTextFromBlob),
    toEqual: option.some('masumoto'),
  }),
  'wrap and extract does not return another string': fail({
    expect: pipe('masumoto', stringToBlob, getTextFromBlob),
    toEqual: option.some('nazuna'),
  }),
  'wrap and extract does not return none': fail({
    expect: pipe('masumoto', stringToBlob, getTextFromBlob),
    toEqual: option.none,
  }),
};

runTests(tests, expect, it);
