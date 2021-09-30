import { Dictionary } from 'lodash';
import {
  OnCreateTrigger,
  OnDeleteTrigger,
  OnUpdateTrigger,
} from './firebase-functions';

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

export type DocumentData = Dictionary<FirestoreDataType>;

export type ViewTrigger = {
  readonly onSrcCreated: OnCreateTrigger;
  readonly onSrcUpdated: OnUpdateTrigger;
  readonly onSrcDeleted: OnDeleteTrigger;
  readonly onJoinRefUpdated: Dictionary<OnUpdateTrigger>;
};

export type CollectionTrigger = {
  readonly onRefDeleted: Dictionary<OnDeleteTrigger | undefined>;
  readonly view: Dictionary<ViewTrigger>;
};
