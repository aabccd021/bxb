import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import { describe, expect, it } from 'vitest';

export const getTextFromBlob = async (downloadResult: O.Option<Blob>) => {
  const donwloadResultBlob: Blob | undefined = pipe(
    downloadResult,
    O.getOrElse<undefined>(() => undefined)
  );
  const downloadResultText = await donwloadResultBlob?.text();
  return downloadResultText;
};

export const stringBlob = (text: string) => new Blob([text]);

describe.concurrent('util', () => {
  describe.concurrent('stringBlob & getTextFromBlob', () => {
    it('blob content is its wrapped text', async () => {
      const blob = stringBlob('masumoto');
      const result = await getTextFromBlob(O.of(blob));
      expect(result).toStrictEqual('masumoto');
    });

    it('blob content is not equal to other than its wrapped text', async () => {
      const blob = stringBlob('masumoto');
      const result = await getTextFromBlob(O.of(blob));
      expect(result).not.toStrictEqual('nazuna');
    });
  });
});
