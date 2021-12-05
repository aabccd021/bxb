import * as t from 'io-ts';

// eslint-disable-next-line functional/prefer-type-literal
export interface Dict<T> {
  readonly [key: string]: T;
}

export const StringDFS = t.type({ type: t.literal('string') });
export type StringDFS = t.TypeOf<typeof StringDFS>;

export const RefIdDFS = t.type({
  type: t.literal('refId'),
  refToCollection: t.string, // name of the collection of the referred doc
});
export type RefIdDFS = t.TypeOf<typeof RefIdDFS>;

export const DFS = t.union([StringDFS, RefIdDFS]);
export type DFS = t.TypeOf<typeof DFS>;

export const CollectionDataSpec = t.record(t.string, DFS);
export type CollectionDataSpec = t.TypeOf<typeof CollectionDataSpec>;

export const NullableCollectionDataSpec = t.union([
  CollectionDataSpec,
  t.undefined,
]);
export type NullableCollectionDataSpec = t.TypeOf<
  typeof NullableCollectionDataSpec
>;

export const SelectViewSpec = t.undefined;
export type SelectViewSpec = t.TypeOf<typeof SelectViewSpec>;

export const CountViewSpec = t.type({
  type: t.literal('count'),
  count: t.string,
  groupBy: t.string,
});
export type CountViewSpec = t.TypeOf<typeof CountViewSpec>;

export const ViewFieldSpec = t.union([CountViewSpec, SelectViewSpec]);
export type ViewFieldSpec = t.TypeOf<typeof ViewFieldSpec>;

export const ViewSpec = t.record(t.string, ViewFieldSpec);
export type ViewSpec = t.TypeOf<typeof ViewSpec>;

export const CollectionViewSpecs = t.record(t.string, ViewSpec);
export type CollectionViewSpecs = t.TypeOf<typeof CollectionViewSpecs>;

export const NullableCollectionViewSpecs = t.union([
  CollectionViewSpecs,
  t.undefined,
]);
export type NullableCollectionViewSpecs = t.TypeOf<
  typeof NullableCollectionViewSpecs
>;

export const CollectionSpec = t.type({
  data: NullableCollectionDataSpec,
  view: NullableCollectionViewSpecs,
});
export type CollectionSpec = t.TypeOf<typeof CollectionSpec>;

export const Schema = t.record(t.string, CollectionSpec);
export type Schema = t.TypeOf<typeof Schema>;

export const FirebaseConfig = t.type({
  projectId: t.string,
});
export type FirebaseConfig = t.TypeOf<typeof FirebaseConfig>;

export const MasmottConfig = t.type({
  schema: Schema,
  firebase: FirebaseConfig,
});
export type MasmottConfig = t.TypeOf<typeof MasmottConfig>;
