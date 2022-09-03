import { pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import { IORef } from 'fp-ts/IORef';
import * as Record from 'fp-ts/Record';
import * as Task from 'fp-ts/Task';

import { ReadonlyStorageAdmin } from '.';
import { StorageState } from './StorageState';

export const of = (storageState: IORef<StorageState>): ReadonlyStorageAdmin => ({
  download: (id) => pipe(storageState.read, IO.map(Record.lookup(id)), Task.fromIO),
});
