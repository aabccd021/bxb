import * as functions from 'firebase-functions';
import { RefSFSpec } from './field/ref';
import { StringSFSpec } from './field/string';

export type Dict<T> = {
  readonly [key: string]: T;
};

export type SFSpec = StringSFSpec | RefSFSpec;

export type SF = {
  readonly name: string;
  readonly spec: SFSpec;
};

export type RefSpec = {
  readonly collectionName: string;
  readonly fieldName: string;
};

export type JoinSpec = {
  readonly firstRef: RefSpec;
  readonly refChain: readonly RefSpec[];
  readonly selectedFieldNames: readonly string[];
};

export type View = {
  readonly selectedFieldNames: readonly string[];
  readonly joinSpecs: readonly JoinSpec[];
};

export type Collection = {
  readonly src: readonly SF[];
  readonly views: Dict<View>;
};

export type FirestoreDataType = string;

export type ViewTrigger = {
  readonly onSrcCreated: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
  readonly onSrcUpdated: functions.CloudFunction<
    functions.Change<functions.firestore.QueryDocumentSnapshot>
  >;
  readonly onSrcDeleted: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
};
