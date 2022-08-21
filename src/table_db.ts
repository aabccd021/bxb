import * as E from 'fp-ts/Either';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';

type TableDBTriggers = {};

type DocKey = {
  readonly table: string;
  readonly id: string;
};

type DocData = Record<string, unknown>;

type DocSnapshot = { readonly key: DocKey; readonly data: DocData };

type TableDB = {
  readonly setDoc: (snapshot: DocSnapshot) => T.Task<unknown>;
  readonly getDoc: (key: DocKey) => T.Task<unknown>;
};

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

export const createTableDB = (_triggers: TableDBTriggers): IO.IO<TableDB> =>
  pipe(
    tableDBInitialState,
    IORef.newIORef,
    IO.map((db) => ({
      setDoc: (snapshot) => pipe(db.read, IO.map(setDoc(snapshot)), IO.chain(db.write), T.fromIO),
      getDoc: ({ table, id }) =>
        pipe(
          db.read,
          IO.map(
            flow(
              Record.lookup(table),
              O.chain(Record.lookup(id)),
              E.fromOption(() => 'doc not found')
            )
          ),
          T.fromIO
        ),
    }))
  );
