import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { sequenceS } from 'fp-ts/lib/Apply';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';

import {
  DBClient,
  DocSnapshot,
  MakeClientWithTrigger,
  MakeTriggers,
  ReadonlyStorageAdmin,
  StorageAdmin,
  StorageClient,
  StorageTriggers,
  TableDBTriggers,
  WriteonlyStorageAdmin,
} from '.';
import { DocData } from './materialize';

type StorageState = Record<string, Blob>;

const fillStorageTriggersDefaults = (triggers: StorageTriggers): Required<StorageTriggers> => ({
  onUploaded: (_) => T.Do,
  ...triggers,
});

const storageInitialState: StorageState = {};

const makeWriteOnlyStorageAdmin =
  (storageState: IORef.IORef<StorageState>) =>
  (triggers: Required<StorageTriggers>): WriteonlyStorageAdmin => ({
    upload: ({ id, blob }) =>
      pipe(
        storageState.read,
        IO.map(Record.upsertAt(id, blob)),
        IO.chain(storageState.write),
        T.fromIO,
        T.chain(() => triggers.onUploaded(id))
      ),
  });

const storageAdminOf2 =
  (readonlyStorageAdmin: ReadonlyStorageAdmin) =>
  (writeonlyStorageAdmin: WriteonlyStorageAdmin): StorageAdmin => ({
    ...readonlyStorageAdmin,
    ...writeonlyStorageAdmin,
  });

const storageAdminOf =
  (storageState: IORef.IORef<StorageState>, makeTriggers: Required<MakeTriggers>) =>
  (readonlyStorageAdmin: ReadonlyStorageAdmin): StorageAdmin =>
    pipe(
      readonlyStorageAdmin,
      makeTriggers.storage,
      fillStorageTriggersDefaults,
      makeWriteOnlyStorageAdmin(storageState),
      storageAdminOf2(readonlyStorageAdmin)
    );

const makeReadonlyStorageAdmin = (
  storageState: IORef.IORef<StorageState>
): ReadonlyStorageAdmin => ({
  download: (id) => pipe(storageState.read, IO.map(Record.lookup(id)), T.fromIO),
});

const storageAdminOf3 =
  (makeTriggers: Required<MakeTriggers>) =>
  (storageState: IORef.IORef<StorageState>): StorageAdmin =>
    pipe(makeReadonlyStorageAdmin(storageState), storageAdminOf(storageState, makeTriggers));

export const makeStorageClient = (makeTriggers: Required<MakeTriggers>): IO.IO<StorageClient> =>
  pipe(storageInitialState, IORef.newIORef, IO.map(storageAdminOf3(makeTriggers)));

type TableState = Record<string, DocData>;

type DBState = Record<string, TableState>;

const tableDBInitialState: DBState = {};

const setTableDoc = (prevState: DBState, { key: { table, id }, data }: DocSnapshot): TableState =>
  pipe(
    prevState,
    Record.lookup(table),
    O.getOrElse(() => ({})),
    Record.upsertAt(id, data)
  );

const setDoc = (snapshot: DocSnapshot) => (prevState: DBState) =>
  pipe(prevState, Record.upsertAt(snapshot.key.table, setTableDoc(prevState, snapshot)));

export const makeDBClient = (_triggers: TableDBTriggers): IO.IO<DBClient> =>
  pipe(
    tableDBInitialState,
    IORef.newIORef,
    IO.map((db) => ({
      setDoc: (snapshot) => pipe(db.read, IO.map(setDoc(snapshot)), IO.chain(db.write), T.fromIO),
      getDoc: ({ table, id }) =>
        pipe(db.read, IO.map(flow(Record.lookup(table), O.chain(Record.lookup(id)))), T.fromIO),
    }))
  );

const fillTriggersDefaults = (triggers: MakeTriggers): Required<MakeTriggers> => ({
  storage: () => ({}),
  db: () => ({}),
  ...triggers,
});

const makeClients = (makeTriggers: Required<MakeTriggers>) => ({
  storage: makeStorageClient(makeTriggers),
  db: makeDBClient(makeTriggers),
});

export const makeClientWithTrigger: MakeClientWithTrigger = flow(
  fillTriggersDefaults,
  makeClients,
  sequenceS(IO.Apply)
);
