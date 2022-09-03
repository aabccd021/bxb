import { pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import { IORef as IORef_ } from 'fp-ts/IORef';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';

import { StorageTriggers as StorageTriggers_, WriteonlyStorageAdmin } from '.';
import { StorageState as StorageState_ } from './StorageState';

export const of =
  (storageState: IORef_<StorageState_>) =>
  (triggers: Required<StorageTriggers_>): WriteonlyStorageAdmin => ({
    upload: ({ id, blob }) =>
      pipe(
        storageState.read,
        IO.map(Record.upsertAt(id, blob)),
        IO.chain(storageState.write),
        T.fromIO,
        T.chain(() => triggers.onUploaded(id))
      ),
  });
