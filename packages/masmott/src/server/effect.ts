import { flow, pipe } from 'fp-ts/function';
import * as A from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';

import { deleteDoc, getDocuments } from './library/firebase-admin';
import { deleteReferDocs, deleteViewDocs, getReferDocs } from './pure';
import {
  OnRefDeletedParam,
  OnViewSrcDeletedParam,
  SnapshotHandler,
  WriteResult,
} from './type';

/**
 *
 */
export const parallel = <A, B>(mapper: (t: A) => T.Task<B>) =>
  flow(A.map(mapper), T.sequenceArray);

/**
 * Trigger handler that run on source doc `srcDoc` deleted. The trigger will
 * delete all view docs with the same id as srcDoc.
 */
export const onViewSrcDeleted =
  (param: OnViewSrcDeletedParam): SnapshotHandler<readonly WriteResult[]> =>
  (srcDoc) =>
    pipe(
      T.bindTo('ctx')(T.of({ ...param, srcDoc })),
      T.chain(flow(deleteViewDocs, parallel(deleteDoc)))
    );

/**
 * Trigger handler that run on referenced doc `refDoc` deleted. The trigger will
 * delete all docs which refers to refDoc.
 */
export const onRefDeleted =
  (param: OnRefDeletedParam): SnapshotHandler<readonly WriteResult[]> =>
  (refDoc) =>
    pipe(
      T.bindTo('ctx')(T.of({ ...param, refDoc })),
      T.bind('referDocs', flow(getReferDocs, getDocuments)),
      T.chain(flow(deleteReferDocs, parallel(deleteDoc)))
    );
