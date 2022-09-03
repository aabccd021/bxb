import { sequenceS } from 'fp-ts/Apply';
import { flow, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import * as O from 'fp-ts/Option';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';

import {
  DBClient,
  DocData,
  DocSnapshot,
  MakeClientWithTrigger,
  MakeTriggers,
  StorageClient,
  TableDBTriggers,
} from '.';
import * as StorageAdmin from './StorageAdmin';
import * as StorageState from './StorageState';

export const makeStorageClient = (makeTriggers: Required<MakeTriggers>): IO.IO<StorageClient> =>
  pipe(StorageState.empty, IORef.newIORef, IO.map(StorageAdmin.of(makeTriggers)));

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
