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

type DBGenerics = {
  readonly SetDocRight: unknown;
  readonly SetDocLeft: unknown;
  readonly GetDocRight: unknown;
  readonly GetDocLeft: unknown;
};

export type DB<U extends DBGenerics> = {
  readonly setDoc: (doc: DocSnapshot) => TE.TaskEither<U['SetDocLeft'], U['SetDocRight']>;
  readonly getDoc: (
    doc: DocKey
  ) => TE.TaskEither<
    U['GetDocLeft'],
    { readonly data: DocData; readonly context: U['GetDocRight'] }
  >;
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
      onCreate: ({
        id,
        data,
      }: {
        readonly id: string;
        readonly data: DocData;
      }): T.Task<Record<string, E.Either<U['SetDocLeft'], U['SetDocRight']>>> =>
        pipe(
          tableViews,
          Record.mapWithIndex((viewName, _view) =>
            db.setDoc({ key: { id, table: tableName, view: viewName }, data })
          ),
          Record.sequence(T.ApplicativePar)
        ),
    }))
  );
