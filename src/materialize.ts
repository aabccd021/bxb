import { either, magma, record, task, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

export type Field = { readonly relation: 'self' };
export type View = {
  readonly fields: Record<string, Field>;
};
export type TableViews = Record<string, View>;
export type AppViews = Record<string, TableViews>;

export type DocField = unknown;

export type DocData = Record<string, DocField>;

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
  readonly setDoc: (doc: DocSnapshot) => taskEither.TaskEither<U['SetDocLeft'], U['SetDocRight']>;
  readonly getDoc: (
    doc: DocKey
  ) => taskEither.TaskEither<
    U['GetDocLeft'],
    { readonly data: DocData; readonly context: U['GetDocRight'] }
  >;
};

type SetDocReturn<U extends DBG> = either.Either<U['SetDocLeft'], U['SetDocRight']>;

const chooseLeft: magma.Magma<DocField> = { concat: (x) => x };

const filterData =
  (view: View) =>
  (data: DocData): DocData => {
    const selfFieldNames = pipe(
      view.fields,
      record.filter((field) => field.relation === 'self')
    );
    return pipe(data, record.intersection(chooseLeft)(selfFieldNames));
  };

const docSnapshotWithKey =
  (key: DocKey) =>
  (data: DocData): DocSnapshot => ({ key, data });

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
  (viewName: string, view: View): task.Task<SetDocReturn<U>> =>
    pipe(
      data,
      filterData(view),
      docSnapshotWithKey({ id, table: tableName, view: viewName }),
      db.setDoc
    );

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
  (doc: Doc): task.Task<Record<string, SetDocReturn<U>>> =>
    pipe(
      tableViews,
      record.traverseWithIndex(task.ApplicativePar)(onCreateView({ doc, tableName, db }))
    );

export const makeTriggers = <U extends DBG>({
  views,
  db,
}: {
  readonly views: AppViews;
  readonly db: DB<U>;
}) => ({
  db: pipe(
    views,
    record.mapWithIndex((tableName, tableViews) => ({
      onCreate: onCreate({ tableName, tableViews, db }),
    }))
  ),
});
