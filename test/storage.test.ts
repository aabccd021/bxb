import { Blob } from 'buffer';
import * as Array from 'fp-ts/Array';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import { describe, expect, it } from 'vitest';

import { createStorage } from '../src/storage';

describe.concurrent('Storage', () => {
  it('can upload and download', async () => {
    const createNoTriggerStorage = createStorage({});
    const storage = createNoTriggerStorage();

    const id = 'sakurazaka/kira';

    const file = new Blob(['masumoto'], { type: 'text/plain' });
    const upload = storage.upload({ id, file });
    await upload();

    const download = storage.download(id);
    const result = await download();

    expect(result).toStrictEqual(O.of(file));
  });

  it('can run trigger when object uploaded', async () => {
    const logs = IORef.newIORef([])();
    const createStorageWithTrigger = createStorage({
      onUploaded: (id) => pipe(logs.read, IO.map(Array.append(id)), IO.chain(logs.write), T.fromIO),
    });
    const storage = createStorageWithTrigger();

    const id = 'sakurazaka/kira';

    const file = new Blob(['masumoto'], { type: 'text/plain' });
    const upload = storage.upload({ id, file });
    await upload();

    expect(logs.read()).toStrictEqual(['sakurazaka/kira']);
  });
});
