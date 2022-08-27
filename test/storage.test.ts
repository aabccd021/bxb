import * as Array from 'fp-ts/Array';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import { describe, expect, it } from 'vitest';

import { createStorage, fileSnapshot } from '../src/storage';
import { getTextFromBlob, stringBlob } from './util.test';

describe.concurrent('Storage', () => {
  it('can upload and download', async () => {
    const createNoTriggerStorage = createStorage(() => ({}));
    const storage = createNoTriggerStorage();

    const upload = pipe('masumoto', stringBlob, fileSnapshot.id('sakurazaka/kira'), storage.upload);
    await upload();

    const download = storage.download('sakurazaka/kira');
    const result = await download().then(getTextFromBlob);
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

  it('still upload when having trigger', async () => {
    const logs = IORef.newIORef([])();
    const createStorageWithTrigger = createStorage(() => ({
      onUploaded: (id) => pipe(logs.read, IO.map(Array.append(id)), IO.chain(logs.write), T.fromIO),
    }));
    const storage = createStorageWithTrigger();

    const upload = pipe('masumoto', stringBlob, fileSnapshot.id('sakurazaka/kira'), storage.upload);
    await upload();

    const download = storage.download('sakurazaka/kira');
    const result = await download().then(getTextFromBlob);
    expect(result).toStrictEqual('masumoto');
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

    const downloadNazuna = storage.download('yofukashi/nazuna');
    const nazunaResult = await downloadNazuna().then(getTextFromBlob);
    expect(nazunaResult).toStrictEqual('nanakusa');
  });
});
