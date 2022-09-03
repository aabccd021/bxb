import { IORef } from 'fp-ts/IORef';
import { pipe } from 'fp-ts/lib/function';

import {
  MakeTriggers,
  ReadonlyStorageAdmin as ReadonlyStorageAdmin_,
  StorageAdmin,
  WriteonlyStorageAdmin as WriteonlyStorageAdmin_,
} from '.';
import * as ReadonlyStorageAdmin from './ReadonlyStorageAdmin';
import { StorageState as StorageState_ } from './StorageState';
import * as StorageTriggers from './StorageTriggers';
import * as WriteonlyStorageAdmin from './WriteonlyStorageAdmin';

const of3 =
  (readonlyStorageAdmin: ReadonlyStorageAdmin_) =>
  (writeonlyStorageAdmin: WriteonlyStorageAdmin_): StorageAdmin => ({
    ...readonlyStorageAdmin,
    ...writeonlyStorageAdmin,
  });

const of2 =
  (storageState: IORef<StorageState_>, makeTriggers: Required<MakeTriggers>) =>
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
  (storageState: IORef<StorageState_>): StorageAdmin =>
    pipe(ReadonlyStorageAdmin.of(storageState), of2(storageState, makeTriggers));
