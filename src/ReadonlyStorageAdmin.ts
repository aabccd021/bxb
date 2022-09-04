import { io, ioRef, record, task } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { ReadonlyStorageAdmin } from '.';
import { StorageState } from './StorageState';

export const of = (storageState: ioRef.IORef<StorageState>): ReadonlyStorageAdmin => ({
  download: (id) => pipe(storageState.read, io.map(record.lookup(id)), task.fromIO),
});
