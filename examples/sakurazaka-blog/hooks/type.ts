export interface Dictionary<T> {
  readonly [key: string]: T;
}

export type StringFieldSpec = {
  readonly type: "string";
};

export type RefIdFieldSpec = {
  readonly type: "refId";
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
  readonly fieldName: string;
  readonly groupBy: string;
  readonly countedCollectionName: string;
};

export type ViewSpec = {
  readonly selectedFieldNames: readonly string[];
  readonly joinSpecs: readonly JoinSpec[];
  readonly countSpecs: readonly CountSpec[];
};

export type CollectionSpec = {
  readonly src: Dictionary<SrcFieldSpec>;
  readonly views: Dictionary<ViewSpec>;
};
