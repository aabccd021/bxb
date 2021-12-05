import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/ReadonlyRecord';

import {
  DeleteDocAction,
  DocSnapshot,
  GetDocsAction,
  OnRefDeletedCtx,
  OnViewSrcDeletedCtx,
} from './type';

/**
 *
 */
export const makeViewCollectionPath =
  (collection: string) =>
  (view: string): string =>
    `${collection}_${view}`;

/**
 *
 */
export const deleteViewDocs = ({
  ctx: { srcDoc, collection, viewSpecs },
}: {
  readonly ctx: OnViewSrcDeletedCtx;
}): readonly DeleteDocAction[] =>
  pipe(
    viewSpecs,
    R.keys,
    A.map((view) => ({
      _task: 'deleteDoc',
      collection: makeViewCollectionPath(collection)(view),
      id: srcDoc.id,
    }))
  );

/**
 *
 */
export const getReferDocs = ({
  ctx: { referCollection, refIdField, refDoc },
}: {
  readonly ctx: OnRefDeletedCtx;
}): GetDocsAction => ({
  _task: 'getDocs',
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
    A.map((snapshot) => ({
      _task: 'deleteDoc',
      collection: referCollection,
      id: snapshot.id,
    }))
  );
