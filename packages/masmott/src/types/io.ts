import * as t from 'io-ts';

const StringFieldSchema = t.type({ type: t.literal('string') });
export type StringFieldSchema = t.TypeOf<typeof StringFieldSchema>;

const RefIdFieldSchema = t.type({
  type: t.literal('refId'),
  referTo: t.string,
});
export type RefIdFieldSchema = t.TypeOf<typeof RefIdFieldSchema>;

const FieldSchema = t.union([StringFieldSchema, RefIdFieldSchema]);
export type FieldSchema = t.TypeOf<typeof FieldSchema>;

const CollectionDataSpec = t.union([t.record(t.string, FieldSchema), t.undefined]);
export type CollectionDataSpec = t.TypeOf<typeof CollectionDataSpec>;

const SelectViewSpec = t.undefined;

const CountViewSpec = t.type({
  type: t.literal('count'),
  count: t.string,
  groupBy: t.string,
});
export type CountViewSpec = t.TypeOf<typeof CountViewSpec>;

const ViewSpec = t.union([CountViewSpec, SelectViewSpec]);
export type ViewSpec = t.TypeOf<typeof ViewSpec>;

const View = t.record(t.string, ViewSpec);
export type View = t.TypeOf<typeof View>;

const CollectionViews = t.record(t.string, View);
export type CollectionViews = t.TypeOf<typeof CollectionViews>;

const MaybeCollectionViews = t.union([CollectionViews, t.undefined]);
export type MaybeCollectionViews = t.TypeOf<typeof MaybeCollectionViews>;

const CollectionSpec = t.type({
  data: CollectionDataSpec,
  view: MaybeCollectionViews,
});
export type CollectionSpec = t.TypeOf<typeof CollectionSpec>;

const Schema = t.record(t.string, CollectionSpec);
export type Schema = t.TypeOf<typeof Schema>;

const FirebaseConfig = t.type({
  projectId: t.string,
});
export type FirebaseConfig = t.TypeOf<typeof FirebaseConfig>;

export const MasmottConfig = t.type({
  schema: Schema,
  firebase: FirebaseConfig,
});
export type MasmottConfig = t.TypeOf<typeof MasmottConfig>;
