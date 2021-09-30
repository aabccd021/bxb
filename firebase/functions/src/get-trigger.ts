import { Dictionary, isEmpty, mapValues, pick } from 'lodash';
import {
  DocumentSnapshot,
  JoinSpec,
  DocumentData,
  FieldSpec,
  View,
  CollectionSpec,
} from './type';
import { getViewCollectionName, getDocDataChange } from './util';
import { getMaterializedJoinDatas, onJoinRefDocUpdated } from './view/join';
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
 *
 * @param srcDocData
 * @param selectedFieldNames
 * @param joinSpecs
 * @returns
 */
async function makeMaterializedViewDocData(
  srcDocData: DocumentData,
  selectedFieldNames: readonly string[],
  joinSpecs: readonly JoinSpec[]
): Promise<DocumentData> {
  const selectedDocData = pick(srcDocData, selectedFieldNames);

  const joinedDocData = await getMaterializedJoinDatas(srcDocData, joinSpecs);

  const materializedViewDocData: DocumentData = {
    ...selectedDocData,
    ...joinedDocData,
  };
  return materializedViewDocData;
}

/**
 *
 * @param collectionName
 * @param viewName
 * @param srcDoc
 * @param selectedFieldNames
 * @param joinSpecs
 * @returns
 */
export async function createViewDoc(
  collectionName: string,
  viewName: string,
  srcDoc: DocumentSnapshot,
  selectedFieldNames: readonly string[],
  joinSpecs: readonly JoinSpec[]
): Promise<FirebaseFirestore.WriteResult> {
  const viewDocData = await makeMaterializedViewDocData(
    srcDoc.data,
    selectedFieldNames,
    joinSpecs
  );
  const viewDocId = srcDoc.id;
  const viewCollectionName = getViewCollectionName(collectionName, viewName);
  return createDoc(viewCollectionName, viewDocId, viewDocData);
}

/**
 * Make a trigger to run on source document creation.
 * The trigger will create view documents with the same id as updated source document, with
 * materialized view data.
 *
 * @param collectionName
 * @param viewName
 * @param selectedFieldNames
 * @param joinSpecs
 * @returns
 */
function onSrcDocCreated(
  collectionName: string,
  viewName: string,
  selectedFieldNames: readonly string[],
  joinSpecs: readonly JoinSpec[]
): OnCreateTrigger {
  return onCreate(collectionName, async (srcDoc) =>
    createViewDoc(
      collectionName,
      viewName,
      srcDoc,
      selectedFieldNames,
      joinSpecs
    )
  );
}

/**
 * Make a trigger to run on source document update.
 * The trigger will update all view documents with the same id as updated source document, if there
 * is a change.
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
 * Make a trigger to run on source document delete.
 * The trigger will delete all view documents with the same id as deleted source document.
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
 * Make a trigger to run on deletion of a document referenced by source document.
 * The trigger will delete all document that refers to that referenced document.
 *
 * @param collectionName
 * @param src
 * @returns
 */
function onSrcRefDocDeleted(
  collectionName: string,
  src: Dictionary<FieldSpec>
): Dictionary<OnDeleteTrigger | undefined> {
  return mapValues(src, (sourceField, sourceFieldName) => {
    // only create trigger if the field is type of refId (the document has reference to another document)
    if (sourceField.type !== 'ref') {
      return undefined;
    }
    return onDelete(sourceField.refCollection, async (refDoc) => {
      const referrerSrcDocsSnapshot = await getCollection(
        collectionName,
        (collection) => collection.where(sourceFieldName, '==', refDoc.id)
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
  { selectedFieldNames, joinSpecs }: View
): ViewTrigger {
  return {
    onSrcDocCreated: onSrcDocCreated(
      collectionName,
      viewName,
      selectedFieldNames,
      joinSpecs
    ),
    onSrcDocUpdated: onSrcDocUpdated(
      collectionName,
      viewName,
      selectedFieldNames
    ),
    onSrcDocDeleted: onSrcDocDeleted(collectionName, viewName),
    onJoinRefDocUpdated: onJoinRefDocUpdated(
      collectionName,
      viewName,
      joinSpecs
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
