/* eslint-disable functional/no-return-void */
import { FirebaseOptions } from 'firebase/app';
import { DocumentReference } from 'firebase/firestore/lite';
import { ChangeEvent } from 'react';
import { Cache } from 'swr';

import * as Doc from './doc';
import * as DocCreation from './doc-creation';

export type { Doc, DocCreation, DocumentReference, FirebaseOptions };

export type Dict<T> = {
  readonly [key: string]: T;
};

export type StringFieldSpec = {
  readonly type: 'string';
};

export type RefIdFieldSpec = {
  readonly refCollection: string;
  readonly type: 'refId';
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
  readonly countedCollectionName: string;
  readonly groupBy: string;
};

export type ViewSpec = {
  readonly countSpecs: Dict<CountSpec>;
  readonly joinSpecs: Dict<JoinSpec>;
  readonly selectedFieldNames: readonly string[];
};

export type CollectionSpec = {
  readonly src: Dict<SrcFieldSpec>;
  readonly views: Dict<ViewSpec>;
};

export type Spec = Dict<CollectionSpec>;

export type FirestoreDataType = string | number;

export type DocumentData = Dict<FirestoreDataType>;

export type DocumentSnapshot = {
  readonly data: DocumentData;
  readonly id: string;
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
      readonly data: DocData;
      readonly exists: true;
    }
  | {
      readonly exists: false;
    };

export type CreateDoc<CDD extends DocCreationData = DocCreationData> = (
  data: CDD
) => void;

export type Retry = () => void;

export type DocWithId<DD extends DocData = DocData> = {
  readonly data: DD;
  readonly id: string;
};

export type DocSnapshotMutatorCallback = (snapshot: DocSnapshot) => DocSnapshot;

export type MutateDoc = (
  key: DocKey,
  data?: DocSnapshot | DocSnapshotMutatorCallback,
  options?: {
    readonly shouldRevalidate?: true;
    readonly view?: string | undefined;
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

export type ISRPage = (props: {
  readonly snapshot?: { readonly doc: Doc.Type; readonly id: string };
}) => JSX.Element;

export type ViewPath = readonly [string] | readonly [string, string];

export type SetInput = (event: ChangeEvent<HTMLInputElement>) => void;

export type UpdateCountView = (p: {
  readonly countedCollectionName: string;
  readonly counterFieldName: string;
  readonly data: DocData;
  readonly refIdFieldName: string;
  readonly view: string;
  readonly viewCollectionName: string;
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

export type GetId = (
  options: FirebaseOptions,
  collection: string
) => Promise<string>;

export type InitMasmott = (options: FirebaseOptions) => Promise<void>;

export type Fetcher = (path: string) => Promise<DocSnapshot>;

export type MutateDocOfId = (
  id: string,
  data?: DocSnapshot | DocSnapshotMutatorCallback,
  options?: {
    readonly shouldRevalidate?: true;
    readonly view?: string | undefined;
  }
) => Promise<void>;

export type MutateDocOfKey = (
  key: DocKey,
  data?: DocSnapshot | DocSnapshotMutatorCallback,
  options?: {
    readonly shouldRevalidate?: true;
    readonly view?: string | undefined;
  }
) => Promise<void>;