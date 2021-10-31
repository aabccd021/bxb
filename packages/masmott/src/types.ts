/* eslint-disable no-restricted-imports */
import { FirebaseOptions } from 'firebase/app';
import { DocumentReference } from 'firebase/firestore/lite';
import { ChangeEvent } from 'react';
import { Cache } from 'swr';
// eslint-disable-next-line import/no-cycle
import * as Doc from './types/doc';
// eslint-disable-next-line import/no-cycle
import * as DocCreation from './types/doc-creation';

export type { Doc, DocCreation, DocumentReference, FirebaseOptions };

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

export type Spec = Dict<CollectionSpec>;

export type FirestoreDataType = string | number;

export type DocumentData = Dict<FirestoreDataType>;

export type DocumentSnapshot = {
  readonly id: string;
  readonly data: DocumentData;
};

export type QuerySnapshot = {
  readonly docs: readonly DocumentSnapshot[];
};

export type Field = string | number;

export type DocKey<C extends string = string> = readonly [C, string];

export type ViewKey = readonly [string, string, string];

export type DocCreationData = {
  readonly [key: string]: Field;
};

export type DocData = {
  readonly [key: string]: Field;
};

export type DocSnapshot =
  | {
      readonly exists: true;
      readonly data: DocData;
    }
  | {
      readonly exists: false;
    };

export type CreateDoc<CDD extends DocCreationData = DocCreationData> = (data: CDD) => void;

export type Retry = () => void;

export type DocWithId<DD extends DocData = DocData> = {
  readonly id: string;
  readonly data: DD;
};

export type DocSnapshotMutatorCallback = (snapshot: DocSnapshot) => DocSnapshot;

export type MutateDoc = (
  key: DocKey,
  data?: DocSnapshot | DocSnapshotMutatorCallback,
  options?: {
    readonly view?: string | undefined;
    readonly shouldRevalidate?: true;
  }
) => Promise<void>;

export type DocCache = Cache<DocSnapshot>;

export type DocSWRConfig = {
  readonly docCache: DocCache;
  readonly mutateDoc: MutateDoc;
};

export type UpdateCountViews = (data: DocData) => void;

export type ISRPageProps = {
  readonly fallback: Dict<DocSnapshot>;
};

export type ISRPage<DD extends DocData> = (props: {
  readonly snapshot?: { readonly id: string; readonly doc: Doc.Type<DD> };
}) => JSX.Element;

export type ViewPath = readonly [string] | readonly [string, string];

export type SetInput = (event: ChangeEvent<HTMLInputElement>) => void;

export type UpdateCountView = (p: {
  readonly countedCollectionName: string;
  readonly data: DocData;
  readonly refIdFieldName: string;
  readonly viewCollectionName: string;
  readonly view: string;
  readonly counterFieldName: string;
}) => void;

export type Mapped<T extends string | number, VResult> = {
  readonly [P in T]: VResult;
};

export type SetDoc = (
  options: FirebaseOptions,
  collection: string,
  id: string,
  data: DocCreationData
) => Promise<void>;

export type GetId = (options: FirebaseOptions, collection: string) => Promise<string>;

export type InitMasmott = (options: FirebaseOptions) => Promise<void>;

export type Fetcher = (path: string) => Promise<DocSnapshot>;

export type MutateDocOfId = (
  id: string,
  data?: DocSnapshot | DocSnapshotMutatorCallback,
  options?: {
    readonly view?: string | undefined;
    readonly shouldRevalidate?: true;
  }
) => Promise<void>;

export type MutateDocOfKey = (
  key: DocKey,
  data?: DocSnapshot | DocSnapshotMutatorCallback,
  options?: {
    readonly view?: string | undefined;
    readonly shouldRevalidate?: true;
  }
) => Promise<void>;
