/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { flow, pipe } from 'fp-ts/lib/function';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import { CollectionSpec, Dict, Spec, SrcFieldSpec, ViewSpec } from '../src';
import {
  createDoc,
  deleteDoc,
  deleteDoc_,
  getCollection,
  getDocument,
  makeCollectionRef,
  toCollectionQuery,
  toDocumentIds,
  updateDoc,
} from './firebase-admin';
import {
  makeOnCreateTrigger,
  makeOnDeleteTrigger,
  makeOnUpdateTrigger,
} from './firebase-functions';

import * as T from 'fp-ts/lib/Task';
import {
  CollectionTriggers,
  DocumentData,
  DocumentSnapshot,
  FirestoreTriggers,
  OnCreateTrigger,
  OnDeleteTrigger,
  OnDeleteTriggerHandler,
  OnUpdateTrigger,
  Query,
  ViewTriggers,
} from './types';
import * as O from 'fp-ts/lib/Option';
import * as A from 'fp-ts/lib/ReadonlyArray';
import { getDocDataChange, getViewCollectionName } from './util';
import { materializeCountViewData, onCountedDocCreated, onCountedDocDeleted } from './view-count';
import { materializeJoinViewData, onJoinRefDocUpdated } from './view-join';

/**
 * Materialize view document data based on given specification.
 *
 * @param srcDocData Data of the view's source document.
 * @param viewSpec Specification of the view.
 * @returns Materialized view data.
 */
async function materializeViewData(
  srcDocData: DocumentData,
  { selectedFieldNames, joinSpecs, countSpecs }: ViewSpec
): Promise<DocumentData> {
  const selectViewData = pick(srcDocData, selectedFieldNames);

  const joinViewData = await materializeJoinViewData(srcDocData, joinSpecs);

  const countViewData = materializeCountViewData(countSpecs);

  const materializedViewData: DocumentData = {
    ...selectViewData,
    ...joinViewData,
    ...countViewData,
  };
  return materializedViewData;
}

/**
 * Materialize and create a view document based on given specification.
 *
 * @param collectionName Name of the view's collection.
 * @param viewName Name of the view.
 * @param srcDoc Document snapshot of the view's source document
 * @param viewSpec Specification of the view.
 * @returns Creation result of the view document.
 */
export async function createViewDoc(
  collectionName: string,
  viewName: string,
  srcDoc: DocumentSnapshot,
  viewSpec: ViewSpec
): Promise<FirebaseFirestore.WriteResult> {
  const viewDocData = await materializeViewData(srcDoc.data, viewSpec);
  const viewDocId = srcDoc.id;
  const viewCollectionName = getViewCollectionName(collectionName, viewName);
  return createDoc(viewCollectionName, viewDocId, viewDocData);
}

/**
 * Make a trigger to run on source document creation. The trigger will
 * materialize and create view documents with the same id as updated source
 * document, with materialized view data.
 *
 * @param collectionName Name of the view's collection
 * @param viewName Name of the view.
 * @param viewSpec Specification of the
 * @returns Trigger on view's source document created.
 */
function onSrcDocCreated(
  collectionName: string,
  viewName: string,
  viewSpec: ViewSpec
): OnCreateTrigger {
  return makeOnCreateTrigger(collectionName, async (srcDoc) =>
    createViewDoc(collectionName, viewName, srcDoc, viewSpec)
  );
}

/**
 * Make a trigger to run on source document update. The trigger will update all
 * view documents with the same id as updated source document, if there is a
 * change.
 *
 * @param collectionName
 * @param viewName
 * @param selectedFieldNames
 * @returns
 */
function onSrcDocUpdated(
  collectionName: string,
  viewName: string,
  selectedFieldNames: readonly string[]
): OnUpdateTrigger {
  return makeOnUpdateTrigger(collectionName, async (srcDoc) => {
    const allDocDataUpdate = getDocDataChange(srcDoc.data);

    const selectViewUpdateData = pick(allDocDataUpdate, selectedFieldNames);

    // Changing referenceId is not supported at the moment.
    const joinViewUpdateData = {};

    const viewUpdateData = {
      ...selectViewUpdateData,
      ...joinViewUpdateData,
    };

    if (isEmpty(viewUpdateData)) {
      return;
    }
    const viewDocId = srcDoc.id;
    const viewCollectionName = getViewCollectionName(collectionName, viewName);
    await updateDoc(viewCollectionName, viewDocId, viewUpdateData);
  });
}

/**
 * Make a trigger to run on source document delete. The trigger will delete all
 * view documents with the same id as deleted source document.
 *
 * @param collectionName
 * @param viewName
 * @returns
 */
const onSrcDocDeleted = (collectionName: string, viewName: string): OnDeleteTrigger =>
  pipe(
    collectionName,
    makeOnDeleteTrigger(
      (_) => (srcDoc) =>
        pipe(collectionName, getViewCollectionName(viewName), deleteDoc_(srcDoc.id))
    )
  );

const makeQuery =
  (refIdFieldName: string, refDocId: string): Query =>
  (collection) =>
    collection.where(refIdFieldName, '==', refDocId);

const makeOnSrcRefDocDeletedHandler =
  (collectionName: string, sourceFieldName: string): OnDeleteTriggerHandler =>
  (_) =>
  (refDoc) =>
    pipe(
      collectionName,
      makeCollectionRef,
      makeQuery(sourceFieldName, refDoc.id),
      getDocument,
      T.map(flow(toDocumentIds, A.map(deleteDoc(collectionName)))),
      T.chain(T.sequenceArray)
    );

/**
 * Make a trigger to run on deletion of a document referenced by source
 * document. The trigger will delete all document that refers to that referenced
 * document.
 *
 * @param collectionName
 * @param src
 * @returns
 */
const onSrcRefDocDeleted = (
  collectionName: string,
  src: Dict<SrcFieldSpec>
): Dict<O.Option<OnDeleteTrigger>> =>
  mapValues(src, (sourceField, sourceFieldName) =>
    sourceField.type !== 'refId'
      ? O.none
      : pipe(
          sourceField.refCollection,
          makeOnDeleteTrigger(makeOnSrcRefDocDeletedHandler(collectionName, sourceFieldName)),
          O.some
        )
  );

/**
 * Make triggers for a view.
 *
 * @param collectionName Name of the view's collection.
 * @param viewName Name of the view.
 * @param viewSpec Specification of the view.
 * @returns
 */
function makeViewTriggers(
  collectionName: string,
  viewName: string,
  viewSpec: ViewSpec
): ViewTriggers {
  return {
    onSrcDocCreated: onSrcDocCreated(collectionName, viewName, viewSpec),
    onSrcDocUpdated: onSrcDocUpdated(collectionName, viewName, viewSpec.selectedFieldNames),
    onSrcDocDeleted: onSrcDocDeleted(collectionName, viewName),
    onJoinRefDocUpdated: onJoinRefDocUpdated(collectionName, viewName, viewSpec.joinSpecs),
    onCountedDocCreated: onCountedDocCreated(collectionName, viewName, viewSpec.countSpecs),
    onCountedDocDeleted: onCountedDocDeleted(collectionName, viewName, viewSpec.countSpecs),
  };
}

/**
 * Make triggers for a collection.
 *
 * @param collectionSpec Specification of the collection.
 * @param collectionName Name of the collection.
 * @returns Triggers made for the collection.
 */
function makeCollectionTriggers(
  { src, views }: CollectionSpec,
  collectionName: string
): CollectionTriggers {
  return {
    onRefDocDeleted: onSrcRefDocDeleted(collectionName, src),
    view: mapValues(views, (view, viewName) => makeViewTriggers(collectionName, viewName, view)),
  };
}

/**
 * Make triggers for firestore.
 *
 * @param collectionSpecs Collections specs of the app.
 * @returns Triggers made by masmott.
 */
export function makeFirestoreTriggers(collectionSpecs: Spec): FirestoreTriggers {
  return mapValues(collectionSpecs, (collectionSpec, collectionName) =>
    makeCollectionTriggers(collectionSpec, collectionName)
  );
}
