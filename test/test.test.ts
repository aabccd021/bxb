import * as O from 'fp-ts/Option';
import { describe, expect, it } from 'vitest';

import { getTextFromBlob, stringToBlob } from '../src/test';

describe.concurrent('util', () => {
  describe.concurrent('stringBlob & getTextFromBlob', () => {
    it('blob content is its wrapped text', async () => {
      const blob = stringToBlob('masumoto');
      const result = await getTextFromBlob(O.of(blob));
      expect(result).toStrictEqual('masumoto');
    });

    it('blob content is not equal to other than its wrapped text', async () => {
      const blob = stringToBlob('masumoto');
      const result = await getTextFromBlob(O.of(blob));
      expect(result).not.toStrictEqual('nazuna');
    });
  });
});
