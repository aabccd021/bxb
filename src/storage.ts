import { Blob } from 'buffer';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';

type StorageTriggers = {};

type StorageState = Record<string, Blob>;

type Storage = {
  readonly upload: (p: { readonly id: string; readonly file: Blob }) => T.Task<unknown>;
  readonly download: (id: string) => T.Task<O.Option<Blob>>;
};

const initialState: StorageState = {};

export const createStorage = (_triggers: StorageTriggers): IO.IO<Storage> =>
  pipe(
    initialState,
    IORef.newIORef,
    IO.map((storage) => ({
      upload: ({ id, file }) =>
        pipe(storage.read, IO.map(Record.upsertAt(id, file)), IO.chain(storage.write), T.fromIO),
      download: (id) => pipe(storage.read, IO.map(Record.lookup(id)), T.fromIO),
    }))
  );
