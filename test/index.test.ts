import * as E from 'fp-ts/Either';
import * as IO from 'fp-ts/IO';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { describe, expect, it } from 'vitest';

import { DB, DocData, DocSnapshot, makeTriggers } from '../src';
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

const createMockDB = (): DB<TestDB> => {
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

describe.concurrent('masmott', () => {
  describe.concurrent('self field', () => {
    const makeLawakOnCreateTriggers = () => {
      const db = createMockDB();
      return {
        db,
        triggers: makeTriggers({
          db,
          views: {
            lawak: {
              card: {
                fields: {
                  text: {
                    relation: 'self',
                  },
                },
              },
            },
          },
        }),
      };
    };

    describe.concurrent('onCreate', () => {
      it('returns success messages', async () => {
        const { triggers } = makeLawakOnCreateTriggers();
        const onLawakCreateTrigger = triggers.lawak.onCreate({
          id: 'fooLawak',
          data: { text: 'lawak text' },
        });

        const triggerResult = await onLawakCreateTrigger();

        expect(triggerResult).toStrictEqual({ card: E.right('setDoc success') });
      });

      it('creates materialized view', async () => {
        const { db, triggers } = makeLawakOnCreateTriggers();
        const onLawakCreateTrigger = triggers.lawak.onCreate({
          id: 'fooLawak',
          data: { text: 'lawak text' },
        });

        await onLawakCreateTrigger();

        const getMaterializedDocResult = await db.getDoc({
          table: 'lawak',
          view: 'card',
          id: 'fooLawak',
        })();
        expect(getMaterializedDocResult).toStrictEqual(
          E.right({
            data: { text: 'lawak text' },
            context: 'doc found',
          })
        );
      });
    });
  });
});
