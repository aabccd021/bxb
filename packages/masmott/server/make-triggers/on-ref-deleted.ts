import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as A from 'fp-ts/lib/ReadonlyArray';
import * as R from 'fp-ts/lib/ReadonlyRecord';
import * as T from 'fp-ts/lib/Task';
import { makeDeleteTrigger } from 'server/firebase-functions/pure';
import { get } from 'server/pure';
import { NullableCollectionDataSpec, RefIdDFS } from 'src/types/io';
import {
  deleteDocWithCollection,
  getDocuments,
} from '../firebase-admin/effect';
import { OnDeleteHandler, OnDeleteTrigger, Query } from '../types';

/**
 *
 */
const makeRefDeletedHandler =
  (refIdField: string) =>
  (collection: string): OnDeleteHandler =>
  (_context) =>
  (refDoc) => {
    const query: Query = {
      collection,
      where: [[refIdField, '==', refDoc.id]],
    };
    const deleteDoc = deleteDocWithCollection(collection);
    return pipe(
      query,
      getDocuments,
      T.chain(flow(A.map(flow(get('id'), deleteDoc)), T.sequenceArray))
    );
  };

/**
 *
 */
export const makeOnRefDeletedTrigger =
  (collection: string) =>
  (refIdField: string, refedCollection: string): OnDeleteTrigger => {
    const handler = makeRefDeletedHandler(refIdField)(collection);
    const toTrigger = makeDeleteTrigger(refedCollection);
    return pipe(handler, toTrigger);
  };

/**
 *
 */
export const makeOnRefDeletedTriggers = (
  collection: string,
  nullableCollectionDataSpec: NullableCollectionDataSpec
) =>
  pipe(
    O.fromNullable(nullableCollectionDataSpec),
    O.map(
      flow(
        R.filterMap(O.fromPredicate(RefIdDFS.is)),
        R.map(get('refToCollection')),
        R.mapWithIndex(makeOnRefDeletedTrigger(collection))
      )
    ),
    O.getOrElseW(() => R.empty)
  );
