import { Blob } from 'buffer';
import * as O from 'fp-ts/Option';
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
});
