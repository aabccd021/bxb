import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { sequenceS } from 'fp-ts/lib/Apply';
import { pipe } from 'fp-ts/lib/function';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';

import { MakeClientWithTrigger } from '.';
import { Storage, StorageAdmin, StorageClient, StorageTriggers } from '.';

type StorageState = Record<string, Blob>;

const emptyTriggers: StorageTriggers = {
  onUploaded: (_) => T.of(undefined),
};

const fillTriggersDefaults = (triggers: Partial<StorageTriggers>): StorageTriggers => ({
  ...emptyTriggers,
  ...triggers,
});

const initialState: StorageState = {};

export const makeStorageClient =
  (makeTriggers: (storage: StorageAdmin) => Partial<StorageTriggers>): IO.IO<StorageClient> =>
  () => {
    const storage = makeStorage();
    const triggers = pipe(storage, makeTriggers, fillTriggersDefaults);
    function makeStorage() {
      return pipe(
        initialState,
        IORef.newIORef,
        IO.map(
          (storageState): Storage => ({
            upload: ({ id, blob }) =>
              pipe(
                storageState.read,
                IO.map(Record.upsertAt(id, blob)),
                IO.chain(storageState.write),
                T.fromIO,
                T.chain(() => triggers.onUploaded(id))
              ),
            download: (id) => pipe(storageState.read, IO.map(Record.lookup(id)), T.fromIO),
          })
        )
      )();
    }
    return storage;
  };

export const makeClientWithTrigger: MakeClientWithTrigger = ({ storage }) =>
  pipe({ storage: makeStorageClient(storage) }, sequenceS(IO.Apply));
