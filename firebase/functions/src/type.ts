import * as functions from 'firebase-functions';

export type CollectionSource<SFSpec> = {
  readonly [fieldName: string]: SFSpec;
};

export type View<VFSpec> = {
  readonly [fieldName: string]: VFSpec;
};

export type CollectionView<VFSpec> = {
  readonly [viewName: string]: View<VFSpec>;
};

export type CollectionConfig<SFSpec, VFSpec> = {
  readonly source: CollectionSource<SFSpec>;
  readonly view: CollectionView<VFSpec>;
};

export type Config<SFSpec, VFSpec> = {
  readonly [collectionName: string]: CollectionConfig<SFSpec, VFSpec>;
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
