import { isEmpty, mapValues, pick } from 'lodash';
import {
  createDoc,
  deleteDoc,
  getCollection,
  updateDoc,
} from './firebase-admin';
import {
  makeOnCreateTrigger,
  makeOnDeleteTrigger,
  makeOnUpdateTrigger,
} from './firebase-functions';
import {
  App,
  CollectionSpec,
  CollectionTriggers,
  Dict,
  DocumentData,
  DocumentSnapshot,
  OnCreateTrigger,
  OnDeleteTrigger,
  OnUpdateTrigger,
  SrcFieldSpec,
  ViewSpec,
  ViewTriggers,
} from './type';
import { getDocDataChange, getViewCollectionName } from './util';
import {
  materializeCountViewData,
  onCountedDocCreated,
  onCountedDocDeleted,
} from './view-count';
import { materializeJoinViewData, onJoinRefDocUpdated } from './view-join';

/**
 * Materialize view document data based on given specification.
 *
 * @param app Firebase app.
 * @param srcDocData Data of the view's source document.
 * @param viewSpec Specification of the view.
 * @returns Materialized view data.
 */
async function materializeViewData(
  app: App,
  srcDocData: DocumentData,
  { selectedFieldNames, joinSpecs, countSpecs }: ViewSpec
): Promise<DocumentData> {
  const selectViewData = pick(srcDocData, selectedFieldNames);

  const joinViewData = await materializeJoinViewData(
    app,
    srcDocData,
    joinSpecs
  );

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
 * @param app Firebase app.
 * @param collectionName Name of the view's collection.
 * @param viewName Name of the view.
 * @param srcDoc Document snapshot of the view's source document
 * @param viewSpec Specification of the view.
 * @returns Creation result of the view document.
 */
export async function createViewDoc(
  app: App,
  collectionName: string,
  viewName: string,
  srcDoc: DocumentSnapshot,
  viewSpec: ViewSpec
): Promise<FirebaseFirestore.WriteResult> {
  const viewDocData = await materializeViewData(app, srcDoc.data, viewSpec);
  const viewDocId = srcDoc.id;
  const viewCollectionName = getViewCollectionName(collectionName, viewName);
  return createDoc(app, viewCollectionName, viewDocId, viewDocData);
}

/**
 * Make a trigger to run on source document creation. The trigger will
 * materialize and create view documents with the same id as updated source
 * document, with materialized view data.
 *
 * @param app Firebase app.
 * @param collectionName Name of the view's collection
 * @param viewName Name of the view.
 * @param viewSpec Specification of the
 * @returns Trigger on view's source document created.
 */
function onSrcDocCreated(
  app: App,
  collectionName: string,
  viewName: string,
  viewSpec: ViewSpec
): OnCreateTrigger {
  return makeOnCreateTrigger(collectionName, async (srcDoc) =>
    createViewDoc(app, collectionName, viewName, srcDoc, viewSpec)
  );
}

/**
 * Make a trigger to run on source document update. The trigger will update all
 * view documents with the same id as updated source document, if there is a
 * change.
 *
 * @param app Firebase app.
 * @param collectionName
 * @param viewName
 * @param selectedFieldNames
 * @returns
 */
function onSrcDocUpdated(
  app: App,
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
    await updateDoc(app, viewCollectionName, viewDocId, viewUpdateData);
  });
}

/**
 * Make a trigger to run on source document delete. The trigger will delete all
 * view documents with the same id as deleted source document.
 *
 * @param app Firebase app.
 * @param collectionName
 * @param viewName
 * @returns
 */
function onSrcDocDeleted(
  app: App,
  collectionName: string,
  viewName: string
): OnDeleteTrigger {
  return makeOnDeleteTrigger(collectionName, async (srcDoc) => {
    const viewDocId = srcDoc.id;
    const viewCollectionName = getViewCollectionName(collectionName, viewName);
    await deleteDoc(app, viewCollectionName, viewDocId);
  });
}

/**
 * Make a trigger to run on deletion of a document referenced by source
 * document. The trigger will delete all document that refers to that referenced
 * document.
 *
 * @param app Firebase app.
 * @param collectionName
 * @param src
 * @returns
 */
function onSrcRefDocDeleted(
  app: App,
  collectionName: string,
  src: Dict<SrcFieldSpec>
): Dict<OnDeleteTrigger | undefined> {
  return mapValues(src, (sourceField, sourceFieldName) => {
    // only create trigger if the field is type of refId (the document has
    // reference to another document)
    if (sourceField.type !== 'refId') {
      return undefined;
    }
    const { refCollection } = sourceField;
    const refidFieldName = sourceFieldName;
    return makeOnDeleteTrigger(refCollection, async (refDoc) => {
      const referrerSrcDocsSnapshot = await getCollection(
        app,
        collectionName,
        (collection) => collection.where(refidFieldName, '==', refDoc.id)
      );

      const referrerDocsDeletes = referrerSrcDocsSnapshot.docs.map((doc) =>
        deleteDoc(app, collectionName, doc.id)
      );

      await Promise.allSettled(referrerDocsDeletes);
    });
  });
}

/**
 * Make triggers for a view.
 *
 * @param app Firebase app.
 * @param collectionName Name of the view's collection.
 * @param viewName Name of the view.
 * @param viewSpec Specification of the view.
 * @returns
 */
function makeViewTriggers(
  app: App,
  collectionName: string,
  viewName: string,
  viewSpec: ViewSpec
): ViewTriggers {
  return {
    onSrcDocCreated: onSrcDocCreated(app, collectionName, viewName, viewSpec),
    onSrcDocUpdated: onSrcDocUpdated(
      app,
      collectionName,
      viewName,
      viewSpec.selectedFieldNames
    ),
    onSrcDocDeleted: onSrcDocDeleted(app, collectionName, viewName),
    onJoinRefDocUpdated: onJoinRefDocUpdated(
      app,
      collectionName,
      viewName,
      viewSpec.joinSpecs
    ),
    onCountedDocCreated: onCountedDocCreated(
      app,
      collectionName,
      viewName,
      viewSpec.countSpecs
    ),
    onCountedDocDeleted: onCountedDocDeleted(
      app,
      collectionName,
      viewName,
      viewSpec.countSpecs
    ),
  };
}

/**
 * Make triggers for a collection.
 *
 * @param app Firebase app.
 * @param collectionSpec Specification of the collection.
 * @param collectionName Name of the collection.
 * @returns Triggers made for the collection.
 */
function makeCollectionTriggers(
  app: App,
  { src, views }: CollectionSpec,
  collectionName: string
): CollectionTriggers {
  return {
    onRefDocDeleted: onSrcRefDocDeleted(app, collectionName, src),
    view: mapValues(views, (view, viewName) =>
      makeViewTriggers(app, collectionName, viewName, view)
    ),
  };
}

/**
 * Make triggers for masmott.
 *
 * @param app Firebase app.
 * @param collectionSpecs Collections specs of the app.
 * @returns Triggers made by masmott.
 */
export function makeMasmottTriggers(
  app: App,
  collectionSpecs: Dict<CollectionSpec>
): Dict<CollectionTriggers> {
  return mapValues(collectionSpecs, (collectionSpec, collectionName) =>
    makeCollectionTriggers(app, collectionSpec, collectionName)
  );
}
