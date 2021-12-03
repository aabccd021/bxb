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
  deleteDocWithId,
  getDocument as getDocuments,
  toCollectionRef,
  toDocumentIds,
  updateDocWithId,
} from './firebase-admin';
import {
  makeOnCreateTrigger,
  toDeleteTriggerOn,
  toUpdateTriggerOnCollection,
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
import { getDocDataChange, toViewCollectionPathWithViewName } from './util';
import { materializeCountViewData, onCountedDocCreated, onCountedDocDeleted } from './view-count';
import { materializeJoinViewData, onJoinRefDocUpdated } from './view-join';
import { doNothing, makeQuery, makeToViewDocUpdate as toUpdateDataWith } from './pure';

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
  const viewCollectionName = toViewCollectionPathWithViewName(collectionName, viewName);
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
 *
 *
 *
 *
 *
 *
 */

/**
 *
 */
const updateDocWith = (collectionName: string, viewName: string, docId: string) =>
  pipe(collectionName, toViewCollectionPathWithViewName(viewName), updateDocWithId(docId));

/**
 *
 */
const makeOnViewSrcDocUpdateTriggerHandler =
  (
    collectionName: string,
    viewName: string,
    selectedFieldNames: readonly string[]
  ): OnUpdateTriggerHandler =>
  (_) =>
  (srcDoc) =>
    pipe(
      srcDoc.data,
      toUpdateDataWith(selectedFieldNames),
      O.fold(doNothing, updateDocWith(collectionName, viewName, srcDoc.id))
    );

/**
 * Make a trigger to run on source document update. The trigger will update all
 * view documents with the same id as updated source document, if there is a
 * change.
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
  return pipe(handler, toUpdateTriggerOnCollection(collectionName));
};

/**
 *
 */
const makeOnViewSrcDocDeletedTriggerHandler =
  (collectionName: string, viewName: string): OnDeleteTriggerHandler =>
  (_) =>
  (srcDoc) =>
    pipe(collectionName, toViewCollectionPathWithViewName(viewName), deleteDocWithId(srcDoc.id));

/**
 * Make a trigger to run on source document delete. The trigger will delete all
 * view documents with the same id as deleted source document.
 */
const onViewSrcDocDeleted = (collectionName: string, viewName: string) => {
  const handler = makeOnViewSrcDocDeletedTriggerHandler(collectionName, viewName);
  return pipe(handler, toDeleteTriggerOn(collectionName));
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
          toDeleteTriggerOn(sourceField.refCollection)
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
