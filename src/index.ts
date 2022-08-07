import { pipe } from 'fp-ts/lib/function';
import * as Record from 'fp-ts/Record';

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

export type DB = {
  readonly setDoc: (doc: Doc) => void;
};

export const makeTriggers = ({ views, db }: { readonly views: AppViews; readonly db: DB }) =>
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
