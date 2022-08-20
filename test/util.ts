import * as E from 'fp-ts/Either';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

import { DB, DocData, DocSnapshot } from '../src';

type TestDB = {
  readonly SetDocRight: string;
  readonly SetDocLeft: string;
  readonly GetDocRight: string;
  readonly GetDocLeft: string;
};

type ViewDocs = Record<string, DocData>;
type TableViews = Record<string, ViewDocs>;
type MockDB = Record<string, TableViews>;

const updateDB =
  ({ key: { table, view, id }, data }: DocSnapshot) =>
  (prevState: MockDB) => {
    const prevTableState = prevState[table] ?? {};
    const prevViewState = prevTableState[view] ?? {};
    return {
      ...prevState,
      [table]: {
        ...prevTableState,
        [view]: {
          ...prevViewState,
          [id]: data,
        },
      },
    };
  };

const emptyDB: MockDB = {};

export const createMockDB: IO.IO<DB<TestDB>> = pipe(
  emptyDB,
  IORef.newIORef,
  IO.map((db) => ({
    setDoc: (snapshot) =>
      pipe(
        db.read,
        IO.map(updateDB(snapshot)),
        IO.chain(db.write),
        TE.fromIO,
        TE.chain(() => TE.right<string, string>('setDoc success'))
      ),
    getDoc: ({ table, view, id }) =>
      pipe(
        db.read,
        IO.map((res) =>
          pipe(
            res[table]?.[view]?.[id],
            O.fromNullable,
            O.map((data) => ({ data, context: 'doc found' })),
            E.fromOption(() => 'doc not found')
          )
        ),
        T.fromIO
      ),
  }))
);
