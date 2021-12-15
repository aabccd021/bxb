import { Dict, SelectViewSpec, ViewSpec } from '@core/type';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/ReadonlyRecord';
import * as TUPLE from 'fp-ts/ReadonlyTuple';

import {
  CreateDocAction,
  DeleteDocAction,
  DocSnapshot,
  GetDocsAction,
  LogAction,
  OnRefDeletedCtx,
  OnViewSrcCreatedCtx,
  OnViewSrcDeletedCtx,
  SnapshotTriggerCtx,
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
export const intersectionFst = R.intersection({ concat: (x, _) => x });

/**
 *
 */
export const materializeSelectView = (
  selectViewSpec: SelectViewSpec,
  srcDocData: Dict<unknown>
) => pipe(srcDocData, intersectionFst(selectViewSpec));

export const materializeView = (
  { select }: ViewSpec,
  srcDocData: Dict<unknown>
) => ({ ...materializeSelectView(select, srcDocData) });

/**
 *
 */
export const createViews = ({
  ctx: { collection, viewSpecs: selectViewSpecs },
  triggerCtx: { snapshot: srcDoc },
}: {
  readonly ctx: OnViewSrcCreatedCtx;
  readonly triggerCtx: SnapshotTriggerCtx;
}): readonly CreateDocAction[] =>
  pipe(
    selectViewSpecs,
    R.mapWithIndex(
      (view, viewSpec) =>
        ({
          _task: 'createDoc',
          collection: makeViewCollectionPath(collection)(view),
          data: materializeView(viewSpec, srcDoc.data),
          id: srcDoc.id,
        } as CreateDocAction)
    ),
    R.toReadonlyArray,
    A.map(TUPLE.snd)
  );

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
export const logErrors = ({
  ctx: { errorMessage },
  writeResults,
}: {
  readonly ctx: { readonly errorMessage: string };
  readonly writeResults: readonly (readonly [
    unknown,
    E.Either<unknown, unknown>
  ])[];
}): readonly LogAction[] =>
  pipe(
    writeResults,
    A.map(([action, result]) =>
      pipe(
        result,
        E.swap,
        O.fromEither,
        O.map((error) => [action, error] as const)
      )
    ),
    A.compact,
    A.map(([action, error]) => ({
      _task: 'log',
      jsonPayload: { action, error },
      message: errorMessage,
      severity: 'ERROR',
    }))
  );

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
