import { pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import { IORef } from 'fp-ts/lib/IORef';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';

import { StorageTriggers, WriteonlyStorageAdmin } from '.';
import { StorageState } from './StorageState';

export const of =
  (storageState: IORef<StorageState>) =>
  (triggers: Required<StorageTriggers>): WriteonlyStorageAdmin => ({
    upload: ({ id, blob }) =>
      pipe(
        storageState.read,
        IO.map(Record.upsertAt(id, blob)),
        IO.chain(storageState.write),
        T.fromIO,
        T.chain(() => triggers.onUploaded(id))
      ),
  });
