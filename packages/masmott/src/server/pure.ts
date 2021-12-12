import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/ReadonlyRecord';
import * as TUPLE from 'fp-ts/ReadonlyTuple';

import {
  DeleteDocAction,
  DocSnapshot,
  GetDocsAction,
  LogAction,
  OnRefDeletedCtx,
  OnViewSrcDeletedCtx,
  SnapshotTriggerCtx,
} from './type';

/**
 *
 */
// export const createViews = ({
//   ctx: { collection, viewSpecs },
//   triggerCtx: { snapshot: srcDoc },
// }: {
//   readonly ctx: OnViewSrcCreatedCtx;
//   readonly triggerCtx: SnapshotTriggerCtx;
// }): readonly CreateDocAction[] => pipe(viewS);

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
  ctx: { collection, viewSpecs },
  triggerCtx: { snapshot: srcDoc },
}: {
  readonly ctx: OnViewSrcDeletedCtx;
  readonly triggerCtx: SnapshotTriggerCtx;
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
export const logErrors =
  (message: string) =>
  ({
    ctx,
    writeResults,
  }: {
    readonly ctx: unknown;
    readonly writeResults: readonly (readonly [
      unknown,
      E.Either<unknown, unknown>
    ])[];
  }): readonly LogAction[] =>
    pipe(
      writeResults,
      A.map(
        flow(
          TUPLE.mapSnd(flow(E.swap, O.fromEither)),
          ([action, errorOption]) =>
            pipe(
              errorOption,
              O.map((error) => [action, error] as const)
            )
        )
      ),
      A.compact,
      A.map(([action, error]) => ({
        _task: 'log',
        jsonPayload: { action, ctx, error },
        message,
        severity: 'ERROR',
      }))
    );

/**
 *
 */
export const logErrorsOnViewSrcDeleted = logErrors('onViewSrcDeleted');

/**
 *
 */
export const logErrorsOnRefDeleted = logErrors('onRefDeleted');

/**
 *
 */
export const getReferDocs = ({
  ctx: { referCollection, refIdField },
  triggerCtx: { snapshot: refDoc },
}: {
  readonly ctx: OnRefDeletedCtx;
  readonly triggerCtx: SnapshotTriggerCtx;
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
