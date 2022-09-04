import { option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { describe, expect, it } from 'vitest';

import { getTextFromBlob, stringToBlob } from '../src/test';

describe.concurrent('util', () => {
  describe.concurrent('stringBlob & getTextFromBlob', () => {
    it('blob content is its wrapped text', async () => {
      const stringToBlobToText = pipe('masumoto', stringToBlob, option.of, getTextFromBlob);
      const result = await stringToBlobToText();
      expect(result).toStrictEqual(option.some('masumoto'));
    });

    it('blob content is not equal to other than its wrapped text', async () => {
      const stringToBlobToText = pipe('masumoto', stringToBlob, option.of, getTextFromBlob);
      const result = await stringToBlobToText();
      expect(result).not.toStrictEqual(option.some('nazuna'));
    });
  });
});
