import * as t from 'io-ts';
import { Dict } from 'src/types';

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

const CountViewSchema = t.type({
  type: t.literal('count'),
  count: t.string,
  groupBy: t.string,
});
export type CountViewSchema = t.TypeOf<typeof CountViewSchema>;

const View = t.record(t.string, CountViewSchema);
export type View = t.TypeOf<typeof View>;

const ViewSchemas = t.union([t.record(t.string, View), t.undefined]);
export type ViewSchemas = t.TypeOf<typeof ViewSchemas>;

const CollectionSpec = t.type({
  data: CollectionDataSpec,
  view: ViewSchemas,
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

export type WriteFileDict = Dict<string | WriteFileDict>;
