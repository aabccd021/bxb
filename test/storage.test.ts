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

  it.skip('can use storage inside trigger', async () => {
    const nazunaFile = new Blob(['nanakusa'], { type: 'text/plain;charset=UTF-8' });
    const kiraFile = new Blob(['masumoto'], { type: 'text/plain;charset=UTF-8' });

    const createStorageWithTrigger = createStorage((storage) => ({
      onUploaded: (id) =>
        id === 'sakurazaka/kira'
          ? storage.upload({ id: 'yofukashi/nazuna', file: nazunaFile })
          : T.of(undefined),
    }));
    const storage = createStorageWithTrigger();

    const upload = storage.upload({ id: 'sakurazaka/kira', file: kiraFile });
    await upload();

    const downloadKira = storage.download('sakurazaka/kira');
    const kiraResult = await downloadKira();
    const getKiraResultText: T.Task<string> | undefined = pipe(
      kiraResult,
      O.map((result) => result.text as T.Task<string>),
      O.getOrElse<undefined>(() => undefined)
    );
    const kiraResultText = await getKiraResultText?.();
    expect(kiraResultText).toStrictEqual('masumoto');
  });
});
