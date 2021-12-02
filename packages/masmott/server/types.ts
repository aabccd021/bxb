// eslint-disable-next-line no-restricted-imports
import {
  CollectionReference,
  DocumentReference,
  DocumentSnapshot as FirestoreDocumentSnapshot,
  FieldValue,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import {
  Change,
  CloudFunction,
  EventContext,
  firestore,
  HttpsFunction,
  SUPPORTED_REGIONS,
} from 'firebase-functions';
import { Task } from 'fp-ts/lib/Task';
import { Option } from 'fp-ts/lib/Option';
import { Dict } from '../src';

export type { Change };
export type { FirestoreDocumentSnapshot, QueryDocumentSnapshot, DocumentReference, EventContext };

export type FirestoreDataType = string | number;

export type FirestoreWriteDataType = FirestoreDataType | FieldValue;

export type DocumentData = Dict<FirestoreDataType>;

export type WriteDocumentData = Dict<FirestoreWriteDataType>;

export type DocumentDataChange = {
  readonly before: DocumentData;
  readonly after: DocumentData;
};

export type DocumentChangeSnapshot = {
  readonly id: string;
  readonly data: DocumentDataChange;
};

export type DocumentSnapshot = {
  readonly id: string;
  readonly data: unknown;
};

export type DocumentBuilder = firestore.DocumentBuilder;

export type OnCreateTrigger = CloudFunction<firestore.QueryDocumentSnapshot>;

export type OnDeleteTrigger = OnCreateTrigger;

export type OnUpdateTrigger = CloudFunction<Change<firestore.QueryDocumentSnapshot>>;

export type ViewTriggers = {
  readonly onSrcDocCreated: OnCreateTrigger;
  readonly onSrcDocUpdated: OnUpdateTrigger;
  readonly onSrcDocDeleted: OnDeleteTrigger;
  readonly onJoinRefDocUpdated: Dict<OnUpdateTrigger>;
  readonly onCountedDocCreated: Dict<OnCreateTrigger>;
  readonly onCountedDocDeleted: Dict<OnDeleteTrigger>;
};

export type CollectionTriggers = {
  readonly onRefDocDeleted: Dict<Option<OnDeleteTrigger>>;
  readonly view: Dict<ViewTriggers>;
};

export type FirestoreTriggers = Dict<CollectionTriggers>;

export type OnCreateTriggerHandler = (
  context: EventContext
) => (snapshot: DocumentSnapshot) => Task<unknown>;

export type OnDeleteTriggerHandler = OnCreateTriggerHandler;

export type OnUpdateTriggerHandler = (
  context: EventContext
) => (change: DocumentChangeSnapshot) => Task<unknown>;

export type GetDocTriggerOptions = {
  readonly regions?: ReadonlyArray<typeof SUPPORTED_REGIONS[number]>;
};

export type FunctionsFirestore = {
  readonly document: (path: string) => firestore.DocumentBuilder;
  readonly namespace: (namespace: string) => firestore.NamespaceBuilder;
  readonly database: (database: string) => firestore.DatabaseBuilder;
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

export type Functions = {
  readonly firestore: FirestoreTriggers;
  readonly nextjs: HttpsFunction;
};

export type Query = (
  collectionRef: FirebaseFirestore.CollectionReference<DocumentData>
) => FirebaseFirestore.Query<DocumentData>;

export type CollectionQuery = CollectionReference | FirebaseFirestore.Query;
