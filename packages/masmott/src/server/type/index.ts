import { CollectionViewSpecs } from '@core/type';
import { Task } from 'fp-ts/Task';

export type DocSnapshot = {
  readonly data: unknown;
  readonly id: string;
};

export const WHERE_FILTER_OP = [
  '<',
  '<=',
  '==',
  '!=',
  '>=',
  '>',
  'array-contains',
  'in',
  'not-in',
  'array-contains-any',
] as const;

export type WhereFilterOp = typeof WHERE_FILTER_OP[number];

export type WhereQuerySpec = readonly [string, WhereFilterOp, string];

export type WhereQuerySpecs = readonly WhereQuerySpec[];

export type Query = {
  readonly collection: string;
  readonly where?: WhereQuerySpecs;
};

export type DocumentDataChange = {
  readonly after: unknown;
  readonly before: unknown;
};

export type DocumentChangeSnapshot = {
  readonly data: DocumentDataChange;
  readonly id: string;
};

export type EventContext = unknown;

export type WriteResult = unknown;

export type NonNestedTask<T> = T extends Task<unknown> ? never : Task<T>;

export type SnapshotHandler<T = unknown> = (
  snapshot: DocSnapshot,
  context: EventContext
) => NonNestedTask<T>;

export type ChangeHanlder<T = unknown> = (
  change: DocumentChangeSnapshot,
  context: EventContext
) => NonNestedTask<T>;

export type DeleteDocAction = {
  readonly _task: 'deleteDoc';
  readonly collection: string;
  readonly id: string;
};

export type GetDocsAction = {
  readonly _task: 'getDocs';
  readonly collection: string;
  readonly where?: WhereQuerySpecs;
};

export type OnViewSrcDeletedParam = {
  readonly collection: string;
  readonly viewSpecs: CollectionViewSpecs;
};

export type OnViewSrcDeletedCtx = OnViewSrcDeletedParam & {
  readonly srcDoc: DocSnapshot;
};

export type OnRefDeletedParam = {
  readonly refIdField: string;
  readonly referCollection: string;
};

export type OnRefDeletedCtx = OnRefDeletedParam & {
  readonly refDoc: DocSnapshot;
};
