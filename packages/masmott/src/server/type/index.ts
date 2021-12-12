import { CollectionViewSpecs, Dict } from '@core/type';
import * as T from 'fp-ts/Task';

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

export type WriteResult = {
  readonly writeTime: {
    readonly nanoseconds: number;
    readonly seconds: number;
  };
};

export type SnapshotTriggerCtx = {
  readonly snapshot: DocSnapshot;
};

export type SnapshotTrigger<U = unknown> = (
  params: SnapshotTriggerCtx
) => T.Task<U>;

export type ChangeHanlder<U = unknown> = (params: {
  readonly change: DocumentChangeSnapshot;
}) => T.Task<U>;

export declare type LogSeverity =
  | 'DEBUG'
  | 'INFO'
  | 'NOTICE'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL'
  | 'ALERT'
  | 'EMERGENCY';

export type LogAction = {
  readonly _task: 'log';
  readonly jsonPayload?: {
    readonly [key: string]: unknown;
  };
  readonly message: string;
  readonly severity: LogSeverity;
};

export type CreateDocAction = {
  readonly _task: 'createDoc';
  readonly collection: string;
  readonly data: Dict<unknown>;
  readonly id: string;
};

export type UpdateDocAction = {
  readonly _task: 'createDoc';
  readonly collection: string;
  readonly data: Dict<unknown>;
  readonly id: string;
};

export type DeleteDocAction = {
  readonly _task: 'deleteDoc';
  readonly collection: string;
  readonly id: string;
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

export type OnViewSrcDeletedCtx = {
  readonly collection: string;
  readonly viewSpecs: CollectionViewSpecs;
};

export type OnRefDeletedCtx = {
  readonly refIdField: string;
  readonly referCollection: string;
};
