import { Blob } from 'buffer';
import * as Array from 'fp-ts/Array';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import { describe, expect, it } from 'vitest';

import { createStorage, fileSnapshot } from '../src/storage';

const getText = async (downloadResult: O.Option<Blob>) => {
  const donwloadResultBlob: Blob | undefined = pipe(
    downloadResult,
    O.getOrElse<undefined>(() => undefined)
  );
  const downloadResultText = await donwloadResultBlob?.text();
  return downloadResultText;
};

const stringBlob = (text: string) => new Blob([text]);

describe.concurrent('Storage', () => {
  it('can upload and download', async () => {
    const createNoTriggerStorage = createStorage(() => ({}));
    const storage = createNoTriggerStorage();

    const upload = pipe('masumoto', stringBlob, fileSnapshot.id('sakurazaka/kira'), storage.upload);
    await upload();

    const download = storage.download('sakurazaka/kira');
    const result = await download().then(getText);
    expect(result).toStrictEqual('masumoto');
  });

  it('can run trigger when object uploaded', async () => {
    const logs = IORef.newIORef([])();
    const createStorageWithTrigger = createStorage(() => ({
      onUploaded: (id) => pipe(logs.read, IO.map(Array.append(id)), IO.chain(logs.write), T.fromIO),
    }));
    const storage = createStorageWithTrigger();

    const upload = pipe('masumoto', stringBlob, fileSnapshot.id('sakurazaka/kira'), storage.upload);
    await upload();

    expect(logs.read()).toStrictEqual(['sakurazaka/kira']);
  });

  it('can use storage inside trigger', async () => {
    const createStorageWithTrigger = createStorage((storage) => ({
      onUploaded: (id) =>
        id === 'sakurazaka/kira'
          ? pipe('nanakusa', stringBlob, fileSnapshot.id('yofukashi/nazuna'), storage.upload)
          : T.of(undefined),
    }));
    const storage = createStorageWithTrigger();

    const upload = pipe('masumoto', stringBlob, fileSnapshot.id('sakurazaka/kira'), storage.upload);
    await upload();

    const downloadKira = storage.download('sakurazaka/kira');
    const kiraResult = await downloadKira().then(getText);
    expect(kiraResult).toStrictEqual('masumoto');

    const downloadNazuna = storage.download('yofukashi/nazuna');
    const nazunaResult = await downloadNazuna().then(getText);
    expect(nazunaResult).toStrictEqual('nanakusa');
  });
});
