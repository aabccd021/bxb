import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';
import * as t from 'io-ts';

type StorageTriggers = {
  readonly onUploaded: (id: string) => T.Task<unknown>;
};

type StorageState = Record<string, Blob>;

const BlobFromUnknown = new t.Type<Blob, unknown, unknown>(
  'BlobFromUnknown',
  (u): u is Blob => u instanceof Blob,
  (u, c) => (u instanceof Blob ? t.success(u) : t.failure(u, c)),
  (a) => a
);

export const FileSnapshot = t.type({
  id: t.string,
  blob: BlobFromUnknown,
});

export type FileSnapshot = t.TypeOf<typeof FileSnapshot>;

export type Storage = {
  readonly upload: (p: FileSnapshot) => T.Task<unknown>;
  readonly download: (id: string) => T.Task<O.Option<Blob>>;
};

const emptyTriggers: StorageTriggers = {
  onUploaded: (_) => T.of(undefined),
};

const fillTriggersDefaults = (triggers: Partial<StorageTriggers>): StorageTriggers => ({
  ...emptyTriggers,
  ...triggers,
});

const initialState: StorageState = {};

export const createStorage =
  (makeTriggers: (storage: Storage) => Partial<StorageTriggers>): IO.IO<Storage> =>
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
