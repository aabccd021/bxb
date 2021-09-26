import * as functions from 'firebase-functions';
import { Dictionary } from 'lodash';

export type StringFieldSpec = {
  readonly type: 'string';
};

export type RefFieldSpec = {
  readonly type: 'ref';
  readonly refCollection: string;
};

export type FieldSpec = StringFieldSpec | RefFieldSpec;

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
  readonly src: Dictionary<FieldSpec>;
  readonly views: Dictionary<View>;
};

export type FirestoreDataType = string;

export type ViewTrigger = {
  readonly createViewOnSrcCreated: OnCreateFunction;
  readonly updateViewOnSrcUpdated: OnUpdateFunction;
  readonly deleteViewOnSrcDeleted: OnDeleteFunction;
  readonly deleteSrcOnRefDeleted: Dictionary<OnDeleteFunction | undefined>;
  readonly updateViewOnJoinRefUpdated: Dictionary<OnUpdateFunction>;
};

export type OnCreateFunction =
  functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export type OnDeleteFunction = OnCreateFunction;
export type OnUpdateFunction = functions.CloudFunction<
  functions.Change<functions.firestore.QueryDocumentSnapshot>
>;
