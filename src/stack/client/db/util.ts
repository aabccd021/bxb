import type { IO } from 'fp-ts/IO';
import * as t from 'io-ts';

import type { MockableWindow } from '../../type';
import { getObjectItem } from '../../util';

const DB = t.record(t.string, t.record(t.string, t.unknown));

export const dbLocalStorageKey = 'db';

export const getDb = (getWindow: IO<MockableWindow>) =>
  getObjectItem(getWindow, dbLocalStorageKey, DB.is, (data) => ({
    code: 'ProviderError' as const,
    provider: 'mock',
    value: { message: 'invalid db data loaded', data },
  }));
