import { identity, ioRef } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { Config, StorageAdmin } from '.';
import * as ReadonlyStorageAdmin from './ReadonlyStorageAdmin';
import { StorageState } from './StorageState';
import * as StorageTriggers from './StorageTriggers';
import * as WriteonlyStorageAdmin from './WriteonlyStorageAdmin';

export const of =
  (config: Required<Config>) =>
  (storageState: ioRef.IORef<StorageState>): StorageAdmin =>
    pipe(
      storageState,
      ReadonlyStorageAdmin.of,
      identity.bindTo('readonlyStorageAdmin'),
      identity.bind('writeonlyStorageAdmin', ({ readonlyStorageAdmin }) =>
        pipe(
          readonlyStorageAdmin,
          config.storage,
          StorageTriggers.toRequired,
          WriteonlyStorageAdmin.of(storageState)
        )
      ),
      identity.chain(({ readonlyStorageAdmin, writeonlyStorageAdmin }) => ({
        ...readonlyStorageAdmin,
        ...writeonlyStorageAdmin,
      }))
    );
