import { EventContext } from 'firebase-functions/v1';
import { string } from 'fp-ts';
import { flow, pipe } from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/ReadonlyArray';
import * as T from 'fp-ts/lib/Task';
import * as O from 'fp-ts/lib/Option';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import { CollectionSpec, Dict, Spec, SrcFieldSpec, ViewSpec } from '../src';
import {
  createDoc,
  deleteDoc,
  deleteDoc_,
  getDocument as getDocuments,
  toCollectionRef,
  toDocumentIds,
  updateDoc,
} from './firebase-admin';
import {
  makeOnCreateTrigger,
  toTriggerOnCollection as toTriggerOn,
  makeOnUpdateTrigger,
} from './firebase-functions';
import {
  CollectionTriggers,
  DocumentData,
  DocumentSnapshot,
  FirestoreTriggers,
  OnCreateTrigger,
  OnDeleteTrigger,
  OnDeleteTriggerHandler,
  OnUpdateTrigger,
  OnUpdateTriggerHandler,
  Query,
  ViewTriggers,
} from './types';
import { getDocDataChange, getViewCollectionName } from './util';
import { materializeCountViewData, onCountedDocCreated, onCountedDocDeleted } from './view-count';
import { materializeJoinViewData, onJoinRefDocUpdated } from './view-join';
import { doNothing, makeQuery, makeToViewDocUpdate } from './pure';

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
): T.Task<DocumentData> {
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
): T.Task<FirebaseFirestore.WriteResult> {
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

const makeUpdateViewDoc = (collectionName: string, viewName: string, docId: string) => {
  const toViewCollectionName = getViewCollectionName(viewName);
  const updateViewDoc = updateDoc(docId);
  return pipe(collectionName, toViewCollectionName, updateViewDoc);
};

const makeOnViewSrcDocUpdateTriggerHandler =
  (
    collectionName: string,
    viewName: string,
    selectedFieldNames: readonly string[]
  ): OnUpdateTriggerHandler =>
  (_) =>
  (srcDoc) => {
    const toViewDocUpdate = makeToViewDocUpdate(selectedFieldNames);
    const updateViewDoc = makeUpdateViewDoc(collectionName, viewName, srcDoc.id);
    return pipe(srcDoc.data, toViewDocUpdate, O.fold(doNothing, updateViewDoc));
  };

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
const onViewSrcDocUpdated = (
  collectionName: string,
  viewName: string,
  selectedFieldNames: readonly string[]
): OnUpdateTrigger => {
  const handler = makeOnViewSrcDocUpdateTriggerHandler(
    collectionName,
    viewName,
    selectedFieldNames
  );
  const toTrigger = makeOnUpdateTrigger(collectionName);
  return pipe(handler, toTrigger);
};

const makeOnViewSrcDocDeletedTriggerHandler =
  (collectionName: string, viewName: string): OnDeleteTriggerHandler =>
  (_) =>
  (srcDoc) => {
    const toViewCollectionName = getViewCollectionName(viewName);
    const deleteViewDoc = deleteDoc_(srcDoc.id);
    return pipe(collectionName, toViewCollectionName, deleteViewDoc);
  };

/**
 * Make a trigger to run on source document delete. The trigger will delete all
 * view documents with the same id as deleted source document.
 */
const onViewSrcDocDeleted = (collectionName: string, viewName: string) => {
  const handler = makeOnViewSrcDocDeletedTriggerHandler(collectionName, viewName);
  const toTrigger = toTriggerOn(collectionName);
  return pipe(handler, toTrigger);
};

/**
 *
 */
const makeDeleteAllDocs = (collectionName: string) => {
  const deleteDocs = A.map(deleteDoc(collectionName));
  return flow(toDocumentIds, deleteDocs, T.sequenceArray);
};

/**
 *
 */
const toHandlerWith =
  (sourceFieldName: string) =>
  (collectionName: string): OnDeleteTriggerHandler =>
  (_) =>
  (refDoc) => {
    const toQuery = makeQuery(sourceFieldName, refDoc.id);
    const deleteAllDocs = T.chain(makeDeleteAllDocs(collectionName));
    return pipe(collectionName, toCollectionRef, toQuery, getDocuments, deleteAllDocs);
  };

/**
 * Make a trigger to run on deletion of a document referenced by source
 * document. The trigger will delete all document that refers to that referenced
 * document.
 */
const onSrcRefDocDeleted = (
  collectionName: string,
  src: Dict<SrcFieldSpec>
): Dict<OnDeleteTrigger | undefined> =>
  mapValues(src, (sourceField, sourceRefFieldName) =>
    sourceField.type === 'refId'
      ? pipe(
          collectionName,
          toHandlerWith(sourceRefFieldName),
          toTriggerOn(sourceField.refCollection)
        )
      : undefined
  );

/**
 * Make triggers for a view.
 */
const makeViewTriggers = (
  collectionName: string,
  viewName: string,
  viewSpec: ViewSpec
): ViewTriggers => ({
  onViewSrcDocCreated: onSrcDocCreated(collectionName, viewName, viewSpec),
  onViewSrcDocUpdated: onViewSrcDocUpdated(collectionName, viewName, viewSpec.selectedFieldNames),
  onViewSrcDocDeleted: onViewSrcDocDeleted(collectionName, viewName),
  onJoinRefDocUpdated: onJoinRefDocUpdated(collectionName, viewName, viewSpec.joinSpecs),
  onCountedDocCreated: onCountedDocCreated(collectionName, viewName, viewSpec.countSpecs),
  onCountedDocDeleted: onCountedDocDeleted(collectionName, viewName, viewSpec.countSpecs),
});

/**
 * Make triggers for a collection.
 */
const makeCollectionTriggers = (
  { src, views }: CollectionSpec,
  collectionName: string
): CollectionTriggers => ({
  onRefDocDeleted: onSrcRefDocDeleted(collectionName, src),
  view: mapValues(views, (view, viewName) => makeViewTriggers(collectionName, viewName, view)),
});

/**
 * Make triggers for firestore.
 */
export const makeFirestoreTriggers = (collectionSpecs: Spec): FirestoreTriggers =>
  mapValues(collectionSpecs, (collectionSpec, collectionName) =>
    makeCollectionTriggers(collectionSpec, collectionName)
  );
