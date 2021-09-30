import { Dictionary } from 'lodash';

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

export type View = {
  readonly selectedFieldNames: readonly string[];
  readonly joinSpecs: readonly JoinSpec[];
};

export type CollectionSpec = {
  readonly src: Dictionary<SrcFieldSpec>;
  readonly views: Dictionary<View>;
};

export type FirestoreDataType = string;

export type DocumentData = Dictionary<FirestoreDataType>;

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
