import { flow, pipe } from 'fp-ts/function';
import * as A from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';

import * as FA from './library/firebase-admin';
import { log } from './library/firebase-functions';
import * as pure from './pure';
import {
  OnRefDeletedCtx,
  OnViewSrcCreatedCtx,
  OnViewSrcDeletedCtx,
  SnapshotTriggerHandler,
} from './type';

/**
 *
 */
export const T_parallel = <A, B>(mapToTask: (a: A) => T.Task<B>) =>
  flow(
    A.map((a: A) =>
      pipe(
        a,
        mapToTask,
        T.map((b) => [a, b] as const)
      )
    ),
    T.sequenceArray
  );

/**
 *
 */
export const logWriteResultErrors = (errorMessage: string) =>
  T.chain(flow(pure.logErrors(errorMessage), T_parallel(flow(log, T.fromIO))));

/**
 *
 */
export const onViewSrcCreated =
  (ctx: OnViewSrcCreatedCtx): SnapshotTriggerHandler<'create'> =>
  (triggerCtx) =>
  (runtimeCtx): T.Task<unknown> =>
    pipe(
      pure.createViews(ctx)(triggerCtx)(runtimeCtx),
      T_parallel(FA.createDoc),
      logWriteResultErrors('onViewSrcCreated')
    );

/**
 * Trigger handler that run on source doc `srcDoc` deleted. The trigger will
 * delete all view docs with the same id as srcDoc.
 */
export const onViewSrcDeleted =
  (ctx: OnViewSrcDeletedCtx): SnapshotTriggerHandler<'delete'> =>
  (triggerCtx) =>
  (runtimeCtx): T.Task<unknown> =>
    pipe(
      pure.deleteViewDocs(ctx)(triggerCtx)(runtimeCtx),
      T_parallel(FA.deleteDoc),
      logWriteResultErrors('onViewSrcDeleted')
    );

/**
 * Trigger handler that run on referenced doc `refDoc` deleted. The trigger will
 * delete all docs which refers to refDoc.
 */
export const onRefDeleted =
  (ctx: OnRefDeletedCtx): SnapshotTriggerHandler<'delete'> =>
  (_triggerCtx) =>
  (runtimeCtx): T.Task<unknown> =>
    pipe(
      pure.getReferDocs(ctx)(runtimeCtx),
      FA.getDocs,
      T.chain(
        flow(
          pure.deleteReferDocs(ctx),
          T_parallel(FA.deleteDoc),
          logWriteResultErrors('onRefDeleted')
        )
      )
    );
