import { apply, io, ioRef, option, record, task } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';

import type {
  Config,
  DBClient,
  DocData,
  DocSnapshot,
  MakeClientWithConfig,
  TableDBTriggers,
} from '.';
import * as config from './Config';
import * as storageClient from './StorageClient';

type TableState = Record<string, DocData>;

type DBState = Record<string, TableState>;

const tableDBInitialState: DBState = {};

const setTableDoc = (prevState: DBState, { key: { table, id }, data }: DocSnapshot): TableState =>
  pipe(
    prevState,
    record.lookup(table),
    option.getOrElse(() => ({})),
    record.upsertAt(id, data)
  );

const setDoc = (snapshot: DocSnapshot) => (prevState: DBState) =>
  pipe(prevState, record.upsertAt(snapshot.key.table, setTableDoc(prevState, snapshot)));

export const makeDBClient = (_triggers: TableDBTriggers): io.IO<DBClient> =>
  pipe(
    tableDBInitialState,
    ioRef.newIORef,
    io.map((db) => ({
      setDoc: (snapshot) =>
        pipe(db.read, io.map(setDoc(snapshot)), io.chain(db.write), task.fromIO),
      getDoc: ({ table, id }) =>
        pipe(
          db.read,
          io.map(flow(record.lookup(table), option.chain(record.lookup(id)))),
          task.fromIO
        ),
    }))
  );

const makeClients = (requiredConfig: Required<Config>) => ({
  storage: storageClient.of(requiredConfig),
  db: makeDBClient(requiredConfig),
});

export const makeClientWithConfig: MakeClientWithConfig = flow(
  config.toRequired,
  makeClients,
  apply.sequenceS(io.Apply),
  task.fromIO
);
