import { Dictionary, isEmpty, mapValues, pick } from 'lodash';
import {
  DocumentSnapshot,
  DocumentData,
  SrcFieldSpec,
  ViewSpec,
  CollectionSpec,
} from './type';
import { getViewCollectionName, getDocDataChange } from './util';
import { materializeJoinViewData, onJoinRefDocUpdated } from './view/join';
import { materializeSelectViewData } from './view/select';
import {
  createDoc,
  deleteDoc,
  getCollection,
  updateDoc,
} from './wrapper/firebase-admin';
import {
  OnCreateTrigger,
  onCreate,
  OnUpdateTrigger,
  OnDeleteTrigger,
  onDelete,
  ViewTrigger,
  CollectionTriggers,
  onUpdate,
} from './wrapper/firebase-functions';

/**
 * Materialize view document data based on given specification.
 *
 * @param srcDocData Data of the view's source document.
 * @param viewSpec Specification of the view.
 * @returns Materialized view data.
 */
async function materializeViewData(
  srcDocData: DocumentData,
  { selectedFieldNames, joinSpecs }: ViewSpec
): Promise<DocumentData> {
  const selectViewData = materializeSelectViewData(
    srcDocData,
    selectedFieldNames
  );

  const joinViewData = await materializeJoinViewData(srcDocData, joinSpecs);

  const materializedViewData: DocumentData = {
    ...selectViewData,
    ...joinViewData,
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
  return onCreate(collectionName, async (srcDoc) =>
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
  return onUpdate(collectionName, async (srcDoc) => {
    const allDocDataUpdate = getDocDataChange(srcDoc.data);
    const docDataUpdate = pick(allDocDataUpdate, selectedFieldNames);

    if (!isEmpty(docDataUpdate)) {
      const viewDocId = srcDoc.id;
      const viewCollectionName = getViewCollectionName(
        collectionName,
        viewName
      );
      await updateDoc(viewCollectionName, viewDocId, docDataUpdate);
    }
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
function onSrcDocDeleted(
  collectionName: string,
  viewName: string
): OnDeleteTrigger {
  return onDelete(collectionName, async (srcDoc) => {
    const viewDocId = srcDoc.id;
    const viewCollectionName = getViewCollectionName(collectionName, viewName);
    await deleteDoc(viewCollectionName, viewDocId);
  });
}

/**
 * Make a trigger to run on deletion of a document referenced by source
 * document. The trigger will delete all document that refers to that referenced
 * document.
 *
 * @param collectionName
 * @param src
 * @returns
 */
function onSrcRefDocDeleted(
  collectionName: string,
  src: Dictionary<SrcFieldSpec>
): Dictionary<OnDeleteTrigger | undefined> {
  return mapValues(src, (sourceField, sourceFieldName) => {
    // only create trigger if the field is type of refId (the document has
    // reference to another document)
    if (sourceField.type !== 'refId') {
      return undefined;
    }
    const { refCollection } = sourceField;
    const refidFieldName = sourceFieldName;
    return onDelete(refCollection, async (refDoc) => {
      const referrerSrcDocsSnapshot = await getCollection(
        collectionName,
        (collection) => collection.where(refidFieldName, '==', refDoc.id)
      );

      const referrerDocsDeletes = referrerSrcDocsSnapshot.docs.map((doc) =>
        deleteDoc(collectionName, doc.id)
      );

      await Promise.allSettled(referrerDocsDeletes);
    });
  });
}

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
): ViewTrigger {
  return {
    onSrcDocCreated: onSrcDocCreated(collectionName, viewName, viewSpec),
    onSrcDocUpdated: onSrcDocUpdated(
      collectionName,
      viewName,
      viewSpec.selectedFieldNames
    ),
    onSrcDocDeleted: onSrcDocDeleted(collectionName, viewName),
    onJoinRefDocUpdated: onJoinRefDocUpdated(
      collectionName,
      viewName,
      viewSpec.joinSpecs
    ),
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
    view: mapValues(views, (view, viewName) =>
      makeViewTriggers(collectionName, viewName, view)
    ),
  };
}

/**
 * Make triggers for masmott.
 *
 * @param collectionSpecs Collections specs of the app.
 * @returns Triggers made by masmott.
 */
export function makeMasmottTriggers(
  collectionSpecs: Dictionary<CollectionSpec>
): Dictionary<CollectionTriggers> {
  return mapValues(collectionSpecs, makeCollectionTriggers);
}
