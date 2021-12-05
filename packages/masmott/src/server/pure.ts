import { flow, pipe } from 'fp-ts/function';
import { map } from 'fp-ts/ReadonlyArray';
import { keys } from 'fp-ts/ReadonlyRecord';

import {
  DeleteDocAction,
  DocSnapshot,
  GetDocsAction,
  OnRefDeletedCtx,
  OnViewSrcDeletedCtx,
} from './type';

export const get =
  <U, K extends keyof U>(key: K) =>
  (obj: U) =>
    obj[key];

/**
 *
 */
export const toViewCollectionPath = (
  collection: string,
  view: string
): string => `${collection}_${view}`;
/**
 *
 */
export const toViewDeleteDocAction =
  (collection: string, srcId: string) =>
  (view: string): DeleteDocAction => ({
    collection: toViewCollectionPath(collection, view),
    id: srcId,
  });

/**
 *
 */
export const deleteViewDocs = ({
  ctx: { srcDoc, collection, viewSpecs },
}: {
  readonly ctx: OnViewSrcDeletedCtx;
}): readonly DeleteDocAction[] =>
  pipe(viewSpecs, keys, map(toViewDeleteDocAction(collection, srcDoc.id)));

/**
 *
 */
export const getReferDocs = ({
  ctx: { referCollection, refIdField, refDoc },
}: {
  readonly ctx: OnRefDeletedCtx;
}): GetDocsAction => ({
  collection: referCollection,
  where: [[refIdField, '==', refDoc.id]],
});

/**
 *
 */
export const deleteReferDocs = ({
  referDocs,
  ctx: { referCollection },
}: {
  readonly ctx: OnRefDeletedCtx;
  readonly referDocs: readonly DocSnapshot[];
}): readonly DeleteDocAction[] =>
  pipe(
    referDocs,
    map(flow(get('id'), (id) => ({ collection: referCollection, id })))
  );
