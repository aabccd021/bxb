import * as functions from 'firebase-functions';
import { Dictionary } from 'lodash';
import { RefSFSpec } from './field/ref';
import { StringSFSpec } from './field/string';

export type SFSpec = StringSFSpec | RefSFSpec;

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
  readonly src: Dictionary<SFSpec>;
  readonly views: Dictionary<View>;
};

export type FirestoreDataType = string;

export type ViewTrigger = {
  readonly createViewOnSrcCreated: OnCreateFunction;
  readonly updateViewOnSrcUpdated: OnUpdateFunction;
  readonly deleteViewOnSrcDeleted: OnDeleteFunction;
  readonly deleteSrcOnRefDeleted: Dictionary<OnDeleteFunction | undefined>;
};

export type OnCreateFunction =
  functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export type OnDeleteFunction = OnCreateFunction;
export type OnUpdateFunction = functions.CloudFunction<
  functions.Change<functions.firestore.QueryDocumentSnapshot>
>;
