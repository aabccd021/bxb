/* eslint-disable no-restricted-imports */
import { App } from 'firebase-admin/app';
import {
  FieldValue,
  DocumentSnapshot as FirestoreDocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import {
  Change,
  CloudFunction,
  EventContext,
  firestore,
  SUPPORTED_REGIONS,
} from 'firebase-functions';

export type { FirestoreDocumentSnapshot, Change, QueryDocumentSnapshot };

export type Dict<T> = {
  readonly [key: string]: T;
};

export type StringFieldSpec = {
  readonly type: 'string';
};

export type RefIdFieldSpec = {
  readonly type: 'refId';
  readonly refCollection: string;
};

export type SrcFieldSpec = StringFieldSpec | RefIdFieldSpec;

export type RefSpec = {
  readonly collectionName: string;
  readonly fieldName: string;
};

export type JoinSpec = {
  readonly firstRef: RefSpec;
  readonly refChain: readonly RefSpec[];
  readonly selectedFieldNames: readonly string[];
};

export type CountSpec = {
  readonly groupBy: string;
  readonly countedCollectionName: string;
};

export type ViewSpec = {
  readonly selectedFieldNames: readonly string[];
  readonly joinSpecs: Dict<JoinSpec>;
  readonly countSpecs: Dict<CountSpec>;
};

export type CollectionSpec = {
  readonly src: Dict<SrcFieldSpec>;
  readonly views: Dict<ViewSpec>;
};

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
  readonly data: DocumentData;
};

export type QuerySnapshot = {
  readonly docs: readonly DocumentSnapshot[];
};

export type OnCreateTrigger = CloudFunction<firestore.QueryDocumentSnapshot>;

export type OnDeleteTrigger = OnCreateTrigger;

export type OnUpdateTrigger = CloudFunction<
  Change<firestore.QueryDocumentSnapshot>
>;

export type ViewTriggers = {
  readonly onSrcDocCreated: OnCreateTrigger;
  readonly onSrcDocUpdated: OnUpdateTrigger;
  readonly onSrcDocDeleted: OnDeleteTrigger;
  readonly onJoinRefDocUpdated: Dict<OnUpdateTrigger>;
  readonly onCountedDocCreated: Dict<OnCreateTrigger>;
  readonly onCountedDocDeleted: Dict<OnDeleteTrigger>;
};

export type CollectionTriggers = {
  readonly onRefDocDeleted: Dict<OnDeleteTrigger | undefined>;
  readonly view: Dict<ViewTriggers>;
};

export type OnCreateTriggerHandler = (
  snapshot: DocumentSnapshot,
  context: EventContext
) => Promise<unknown>;

export type OnDeleteTriggerHandler = OnCreateTriggerHandler;

export type OnUpdateTriggerHandler = (
  change: DocumentChangeSnapshot,
  context: EventContext
) => Promise<unknown>;

export type { App };

export type GetDocTriggerOptions = {
  readonly regions?: ReadonlyArray<typeof SUPPORTED_REGIONS[number]>;
};

export type FunctionsFirestore = {
  readonly document: (path: string) => firestore.DocumentBuilder;
  /** @hidden */
  readonly namespace: (namespace: string) => firestore.NamespaceBuilder;
  /** @hidden */
  readonly database: (database: string) => firestore.DatabaseBuilder;
};
