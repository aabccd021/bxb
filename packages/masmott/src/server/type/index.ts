import { CollectionViewSpecs, Dict } from '@core/type';
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

export type Query = {
  readonly collection: string;
  readonly where?: readonly WhereQuerySpec[];
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
  context: EventContext
) => (snapshot: DocSnapshot) => NonNestedTask<T>;

export type ChangeHanlder<T = unknown> = (
  context: EventContext
) => (change: DocumentChangeSnapshot) => NonNestedTask<T>;

export type DataDocWriteType = {
  readonly _type: 'create' | 'update';
  readonly data: Dict<unknown>;
};

export type DeleteDocWriteType = {
  readonly _type: 'delete';
};

export type DocWriteType = DataDocWriteType | DeleteDocWriteType;

export type WriteDocAction = {
  readonly _task: 'writeDoc';
  readonly collection: string;
  readonly id: string;
  readonly write: DocWriteType;
};

export type GetDocsAction = {
  readonly _task: 'getDocs';
  readonly collection: string;
  readonly where?: readonly WhereQuerySpec[];
};

export type OnViewSrcCreatedParam = {
  readonly collection: string;
  readonly viewSpecs: CollectionViewSpecs;
};

export type OnViewSrcCreatedCtx = OnViewSrcCreatedParam & {
  readonly srcDoc: DocSnapshot;
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
