import { ioRef } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import {
  Config,
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
  (storageState: ioRef.IORef<StorageState>, config: Required<Config>) =>
  (readonlyStorageAdmin: ReadonlyStorageAdmin_): StorageAdmin =>
    pipe(
      readonlyStorageAdmin,
      config.storage,
      StorageTriggers.toRequired,
      WriteonlyStorageAdmin.of(storageState),
      of3(readonlyStorageAdmin)
    );

export const of =
  (config: Required<Config>) =>
  (storageState: ioRef.IORef<StorageState>): StorageAdmin =>
    pipe(storageState, ReadonlyStorageAdmin.of, of2(storageState, config));
