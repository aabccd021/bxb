import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { describe, expect, it } from 'vitest';

import { getTextFromBlob, stringToBlob } from '../src/test';

describe.concurrent('util', () => {
  describe.concurrent('stringBlob & getTextFromBlob', () => {
    it('blob content is its wrapped text', async () => {
      const stringToBlobToText = pipe('masumoto', stringToBlob, O.of, getTextFromBlob);
      const result = await stringToBlobToText();
      expect(result).toStrictEqual(O.some('masumoto'));
    });

    it('blob content is not equal to other than its wrapped text', async () => {
      const stringToBlobToText = pipe('masumoto', stringToBlob, O.of, getTextFromBlob);
      const result = await stringToBlobToText();
      expect(result).not.toStrictEqual(O.some('nazuna'));
    });
  });
});
