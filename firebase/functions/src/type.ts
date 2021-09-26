import * as functions from 'firebase-functions';
import { RefSFSpec } from './field/ref';
import { StringSFSpec } from './field/string';

export type SFSpec = StringSFSpec | RefSFSpec;

export type CollectionSrc = {
  readonly [fieldName: string]: SFSpec;
};

export type FirestoreDataType = string;

export type SelectedFieldNames = readonly string[];

export type JoinSpec = {
  readonly refCollectionName: string;
  readonly refFieldName: string;
  readonly selectedFieldNames: SelectedFieldNames;
};

export type View = {
  readonly selectedFieldNames?: SelectedFieldNames;
  readonly joinSpecs?: readonly JoinSpec[];
};

export type CollectionView = {
  readonly [viewname: string]: View;
};

export type Collection = {
  readonly src: CollectionSrc;
  readonly view?: CollectionView;
};

export type Collections = {
  readonly [collectionName: string]: Collection;
};

export type VFTrigger = {
  readonly [triggerName: string]:
    | functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>
    | functions.CloudFunction<
        functions.Change<functions.firestore.QueryDocumentSnapshot>
      >;
};

export type ViewTrigger = {
  readonly [collectionName: string]: VFTrigger;
};

export type MasmottTrigger = {
  readonly [key: string]: {
    readonly [key: string]: {
      readonly [key: string]: VFTrigger;
    };
  };
};

export type GetVFTriggerContext = {
  readonly vfName: string;
  readonly viewCollectionName: string;
  readonly viewName: string;
};
