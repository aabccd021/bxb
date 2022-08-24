import { Blob } from 'buffer';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';

type StorageTriggers = {
  readonly onUploaded: (id: string) => T.Task<unknown>;
};

type StorageState = Record<string, Blob>;

type Storage = {
  readonly upload: (p: { readonly id: string; readonly file: Blob }) => T.Task<unknown>;
  readonly download: (id: string) => T.Task<O.Option<Blob>>;
};

const emptyTriggers: StorageTriggers = {
  onUploaded: (_) => T.of(undefined),
};

const fillTriggersDefaults = (triggers: Partial<StorageTriggers>): StorageTriggers => ({
  ...emptyTriggers,
  ...triggers
});

const initialState: StorageState = {};

const createStorageWithTriggers = (triggers: StorageTriggers): IO.IO<Storage> => {
  return pipe(
    initialState,
    IORef.newIORef,
    IO.map((storage) => ({
      upload: ({ id, file }) =>
        pipe(
          storage.read,
          IO.map(Record.upsertAt(id, file)),
          IO.chain(storage.write),
          T.fromIO,
          T.chain(() => triggers.onUploaded(id))
        ),
      download: (id) => pipe(storage.read, IO.map(Record.lookup(id)), T.fromIO),
    }))
  );
};

export const createStorage = flow(fillTriggersDefaults, createStorageWithTriggers);
