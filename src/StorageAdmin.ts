import { pipe } from 'fp-ts/function';
import { IORef } from 'fp-ts/IORef';

import {
  MakeTriggers,
  ReadonlyStorageAdmin as ReadonlyStorageAdmin_,
  StorageAdmin,
  WriteonlyStorageAdmin as WriteonlyStorageAdmin_,
} from '.';
import * as ReadonlyStorageAdmin from './ReadonlyStorageAdmin';
import { StorageState } from './StorageState';
import * as StorageTriggers from './StorageTriggers';
import * as WriteonlyStorageAdmin from './WriteonlyStorageAdmin';

const of3 =
  (readonlyStorageAdmin: ReadonlyStorageAdmin_) =>
  (writeonlyStorageAdmin: WriteonlyStorageAdmin_): StorageAdmin => ({
    ...readonlyStorageAdmin,
    ...writeonlyStorageAdmin,
  });

const of2 =
  (storageState: IORef<StorageState>, makeTriggers: Required<MakeTriggers>) =>
  (readonlyStorageAdmin: ReadonlyStorageAdmin_): StorageAdmin =>
    pipe(
      readonlyStorageAdmin,
      makeTriggers.storage,
      StorageTriggers.toRequired,
      WriteonlyStorageAdmin.of(storageState),
      of3(readonlyStorageAdmin)
    );

export const of =
  (makeTriggers: Required<MakeTriggers>) =>
  (storageState: IORef<StorageState>): StorageAdmin =>
    pipe(storageState, ReadonlyStorageAdmin.of, of2(storageState, makeTriggers));
