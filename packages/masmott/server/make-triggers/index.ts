import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/ReadonlyRecord';
import {
  CollectionSpec,
  NullableCollectionViewSpecs,
  Schema,
  ViewSpec,
} from '../../src/types/io';
import { makeOnRefsDeletedTriggers } from './on-ref-deleted';
import { makeOnViewSrcDeletedTrigger } from './on-view-src-deleted';

const makeViewTriggers =
  (collection: string) => (view: string, _viewSpec: ViewSpec) => ({
    onSrcDeleted: makeOnViewSrcDeletedTrigger(collection, view),
  });

const makeCollectionViewTriggers = (
  collection: string,
  collectionViews: NullableCollectionViewSpecs
) =>
  pipe(
    O.fromNullable(collectionViews),
    O.map(R.mapWithIndex(makeViewTriggers(collection))),
    O.getOrElseW(() => R.empty)
  );

const makeCollectionTriggers = (
  collection: string,
  collectionSpec: CollectionSpec
) => ({
  view: makeCollectionViewTriggers(collection, collectionSpec.view),
  onRefDeleted: makeOnRefsDeletedTriggers(collection, collectionSpec.data),
});

/**
 *
 */
export const makeTriggers = (schema: Schema) =>
  pipe(schema, R.mapWithIndex(makeCollectionTriggers));
