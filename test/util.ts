import * as IO from 'fp-ts/IO';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';

import { DB, DocData, DocSnapshot } from '../src';
import { makeState } from './effect';

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

export const createMockDB = (): DB<TestDB> => {
  const state = makeState<MockDB>({});
  return {
    setDoc: (snapshot) =>
      pipe(
        state.get,
        IO.map(updateDB(snapshot)),
        IO.chain(state.set),
        TE.fromIO,
        TE.chain(() => TE.right<string, string>('setDoc success'))
      ),
    getDoc: ({ table, view, id }) =>
      pipe(
        state.get()[table]?.[view]?.[id],
        O.fromNullable,
        O.map((data) => ({ data, context: 'doc found' })),
        TE.fromOption(() => 'doc not found')
      ),
  };
};
