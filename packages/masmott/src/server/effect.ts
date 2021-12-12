import { flow, pipe } from 'fp-ts/function';
import * as A from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';

import { deleteDoc, getDocs } from './library/firebase-admin';
import { log } from './library/firebase-functions';
import {
  deleteReferDocs,
  deleteViewDocs,
  getReferDocs,
  logErrorsOnViewSrcDeleted,
} from './pure';
import {
  LogAction,
  OnRefDeletedCtx,
  OnViewSrcCreatedCtx,
  OnViewSrcDeletedCtx,
  SnapshotTrigger,
} from './type';

/**
 *
 */
export const parallel = <A, B>(mapTask: (t: A) => T.Task<B>) =>
  flow(
    A.map((a: A) =>
      pipe(
        a,
        mapTask,
        T.map((b) => [a, b] as const)
      )
    ),
    T.sequenceArray
  );

/**
 *
 */
export const tLog = flow(log, T.fromIO);

/**
 *
 */
export const bindTriggerCtx = flow(T.of, T.bindTo('triggerCtx'));

/**
 *
 */
export const onViewSrcCreated = (
  ctx: OnViewSrcCreatedCtx
): SnapshotTrigger<unknown> =>
  flow(
    bindTriggerCtx,
    T.bind('ctx', () => T.of(ctx))
  );

/**
 * Trigger handler that run on source doc `srcDoc` deleted. The trigger will
 * delete all view docs with the same id as srcDoc.
 */
export const onViewSrcDeleted = (
  ctx: OnViewSrcDeletedCtx
): SnapshotTrigger<readonly (readonly [LogAction, void])[]> =>
  flow(
    bindTriggerCtx,
    T.bind('ctx', () => T.of(ctx)),
    T.bind('writeResults', flow(deleteViewDocs, parallel(deleteDoc))),
    T.chain(flow(logErrorsOnViewSrcDeleted, parallel(tLog)))
  );

/**
 * Trigger handler that run on referenced doc `refDoc` deleted. The trigger will
 * delete all docs which refers to refDoc.
 */
export const onRefDeleted = (
  ctx: OnRefDeletedCtx
): SnapshotTrigger<readonly (readonly [LogAction, void])[]> =>
  flow(
    bindTriggerCtx,
    T.bind('ctx', () => T.of(ctx)),
    T.bind('referDocs', flow(getReferDocs, getDocs)),
    T.bind('writeResults', flow(deleteReferDocs, parallel(deleteDoc))),
    T.chain(flow(logErrorsOnViewSrcDeleted, parallel(tLog)))
  );
