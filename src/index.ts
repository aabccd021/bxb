import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as Record from 'fp-ts/Record';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

export type Field = { readonly relation: 'self' };
export type View = {
  readonly fields: Record<string, Field>;
};
export type TableViews = Record<string, View>;
export type AppViews = Record<string, TableViews>;

export type DocData = Record<string, unknown>;

export type DocKey = {
  readonly view: string;
  readonly id: string;
  readonly table: string;
};

export type DocSnapshot = {
  readonly data: DocData;
  readonly key: DocKey;
};

export type Doc = {
  readonly id: string;
  readonly data: DocData;
};

type DBG = {
  readonly SetDocRight: unknown;
  readonly SetDocLeft: unknown;
  readonly GetDocRight: unknown;
  readonly GetDocLeft: unknown;
};

export type DB<U extends DBG> = {
  readonly setDoc: (doc: DocSnapshot) => TE.TaskEither<U['SetDocLeft'], U['SetDocRight']>;
  readonly getDoc: (
    doc: DocKey
  ) => TE.TaskEither<
    U['GetDocLeft'],
    { readonly data: DocData; readonly context: U['GetDocRight'] }
  >;
};

type SetDocReturn<U extends DBG> = E.Either<U['SetDocLeft'], U['SetDocRight']>;

const onCreateView =
  <U extends DBG>({
    doc: { id, data },
    tableName,
    db,
  }: {
    readonly doc: Doc;
    readonly tableName: string;
    readonly db: DB<U>;
  }) =>
  (viewName: string, _view: View): T.Task<SetDocReturn<U>> =>
    pipe({ key: { id, table: tableName, view: viewName }, data }, db.setDoc);

const onCreate =
  <U extends DBG>({
    tableName,
    tableViews,
    db,
  }: {
    readonly tableName: string;
    readonly tableViews: TableViews;
    readonly db: DB<U>;
  }) =>
  (doc: Doc): T.Task<Record<string, SetDocReturn<U>>> =>
    pipe(
      tableViews,
      Record.mapWithIndex(onCreateView({ doc, tableName, db })),
      Record.sequence(T.ApplicativePar)
    );

export const makeTriggers = <U extends DBG>({
  views,
  db,
}: {
  readonly views: AppViews;
  readonly db: DB<U>;
}) =>
  pipe(
    views,
    Record.mapWithIndex((tableName, tableViews) => ({
      onCreate: onCreate({ tableName, tableViews, db }),
    }))
  );
