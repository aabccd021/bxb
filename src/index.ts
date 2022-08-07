import { pipe } from 'fp-ts/lib/function';
import * as Record from 'fp-ts/Record';
import * as TE from 'fp-ts/TaskEither';

export type Field = { readonly relation: 'self' };
export type View = {
  readonly fields: Record<string, Field>;
};
export type TableViews = Record<string, View>;
export type AppViews = Record<string, TableViews>;

export type DocData = Record<string, unknown>;

export type Doc = {
  readonly table: string;
  readonly view: string;
  readonly id: string;
  readonly data: DocData;
};

type DBGenerics = {
  readonly SetDocRight: unknown;
  readonly SetDocLeft: unknown;
};

export type DB<U extends DBGenerics> = {
  readonly setDoc: (doc: Doc) => TE.TaskEither<U['SetDocLeft'], U['SetDocRight']>;
};

export const makeTriggers = <U extends DBGenerics>({
  views,
  db,
}: {
  readonly views: AppViews;
  readonly db: DB<U>;
}) =>
  pipe(
    views,
    Record.mapWithIndex((tableName, tableViews) => ({
      onCreate: ({ id, data }: { readonly id: string; readonly data: DocData }) =>
        pipe(
          tableViews,
          Record.mapWithIndex((viewName, _view) =>
            db.setDoc({ id, data, table: tableName, view: viewName })
          )
        ),
    }))
  );
