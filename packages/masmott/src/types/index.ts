/* eslint-disable no-restricted-imports */
import { FirebaseOptions } from 'firebase/app';
import { DocumentReference } from 'firebase/firestore/lite';
import { ChangeEvent } from 'react';
import { Cache } from 'swr';
// eslint-disable-next-line import/no-cycle
import * as Doc from './doc';
// eslint-disable-next-line import/no-cycle
import * as DocCreation from './doc-creation';

export type { Doc, DocCreation, DocumentReference, FirebaseOptions };

// eslint-disable-next-line functional/prefer-type-literal
export interface Dict<T> {
  readonly [key: string]: T;
}

// export type RefSpec = {
//   readonly collectionName: string;
//   readonly fieldName: string;
// };

// export type JoinSpec = {
//   readonly firstRef: RefSpec;
//   readonly refChain: readonly RefSpec[];
//   readonly selectedFieldNames: readonly string[];
// };

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

export type CreationField = string | number;

export type DocKey<C extends string = string> = readonly [C, string];

export type ViewKey = readonly [string, string, string];

export type DocCreationData = Dict<CreationField>;

export type DocData = {
  readonly [key: string]: Field;
};

export type DocSnapshot<DD extends DocData = DocData> =
  | {
      readonly exists: true;
      readonly data: DD;
    }
  | {
      readonly exists: false;
    };

export type CreateDoc<DCD extends DocCreationData = DocCreationData> = (data: DCD) => void;

export type Retry = () => void;

export type DocWithId<DD extends DocData = DocData> = {
  readonly id: string;
  readonly data: DD;
};

export type DocCreationWithId<DCD extends DocCreationData> = {
  readonly id: string;
  readonly data: DCD;
};

export type DocSnapshotMutatorCallback<DD extends DocData = DocData> = (
  snapshot: DocSnapshot<DD>
) => DocSnapshot;

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

export type UpdateCountViews<DD extends DocData> = (data: DD, incrementValue: 1 | -1) => void;

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

export type MutateDocWithId = (
  id: string,
  data?: DocSnapshot | DocSnapshotMutatorCallback,
  options?: {
    readonly viewName?: string | undefined;
    readonly shouldRevalidate?: true;
  }
) => Promise<void>;

export type MutateDocWithKey = (
  key: DocKey,
  data?: DocSnapshot | DocSnapshotMutatorCallback,
  options?: {
    readonly viewName?: string | undefined;
    readonly shouldRevalidate?: true;
  }
) => Promise<void>;

export type MutateDocAction = {
  readonly key: DocKey;
  readonly data: DocSnapshot | DocSnapshotMutatorCallback;
  readonly options?: {
    readonly viewName?: string | undefined;
    readonly shouldRevalidate?: true;
  };
};

export type MutateDocs = (actions: readonly MutateDocAction[]) => Promise<unknown>;

export type ViewDocMutationGen<
  COUNTED_DCD extends DocCreationData,
  COUNT_FN extends string = string,
  COUNTER_DD extends { readonly [P in COUNT_FN]: number } & DocData = {
    readonly [P in COUNT_FN]: number;
  } & DocData
> = {
  readonly getDocId: (countedDocData: COUNTED_DCD) => string;
  readonly makeMutatorCallback: (incrementValue: 1 | -1) => DocSnapshotMutatorCallback<COUNTER_DD>;
};

export type ViewDocMutation = {
  readonly docKey: DocKey;
  readonly mutatorCallback: DocSnapshotMutatorCallback;
  readonly viewName: string;
};

export type IncrementSpecs<COUNTED_DCD extends DocCreationData> = Dict<
  Dict<Dict<ViewDocMutationGen<COUNTED_DCD>>>
>;
