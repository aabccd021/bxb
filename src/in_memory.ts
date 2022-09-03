import { sequenceS } from 'fp-ts/Apply';
import { flow, pipe } from 'fp-ts/function';
import * as Io from 'fp-ts/IO';
import { IO } from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import * as O from 'fp-ts/Option';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';

import {
  DBClient,
  DocData,
  DocSnapshot,
  MakeClientWithTrigger,
  MakeTriggers as MakeTriggers_,
  TableDBTriggers,
} from '.';
import * as MakeTriggers from './MakeTriggers';
import * as StorageClient from './StorageClient';

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

export const makeDBClient = (_triggers: TableDBTriggers): IO<DBClient> =>
  pipe(
    tableDBInitialState,
    IORef.newIORef,
    Io.map((db) => ({
      setDoc: (snapshot) => pipe(db.read, Io.map(setDoc(snapshot)), Io.chain(db.write), T.fromIO),
      getDoc: ({ table, id }) =>
        pipe(db.read, Io.map(flow(Record.lookup(table), O.chain(Record.lookup(id)))), T.fromIO),
    }))
  );

const makeClients = (makeTriggers: Required<MakeTriggers_>) => ({
  storage: StorageClient.of(makeTriggers),
  db: makeDBClient(makeTriggers),
});

export const makeClientWithTrigger: MakeClientWithTrigger = flow(
  MakeTriggers.toRequired,
  makeClients,
  sequenceS(Io.Apply)
);
