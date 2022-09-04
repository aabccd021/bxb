import { io, ioRef, record, task } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { StorageTriggers, WriteonlyStorageAdmin } from '.';
import { StorageState } from './StorageState';

export const of =
  (storageState: ioRef.IORef<StorageState>) =>
  (triggers: Required<StorageTriggers>): WriteonlyStorageAdmin => ({
    upload: ({ id, blob }) =>
      pipe(
        storageState.read,
        io.map(record.upsertAt(id, blob)),
        io.chain(storageState.write),
        task.fromIO,
        task.chain(() => triggers.onUploaded(id))
      ),
  });
