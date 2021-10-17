import { isEmpty, mapKeys, mapValues, pick } from 'lodash';

import {
  Dict,
  DocumentData,
  DocumentSnapshot,
  JoinSpec,
  RefSpec,
} from '../type';
import {
  compactObject,
  getDocDataChange,
  getViewCollectionName,
  throwRejectedPromises,
  mergeObjectArray,
} from '../util';
import {
  getDoc,
  getCollection,
  updateDoc,
  App,
} from '../wrapper/firebase-admin';
import {
  onUpdateTrigger,
  OnUpdateTrigger,
} from '../wrapper/firebase-functions';

/**
 * Recursively returns a document referred by join view. Returns latest document
 * snapshot if it is the last document in the whole chain.
 *
 * @param app Firebase app.
 * @param refChain Chain of reference to the document.
 * @param snapshot Latest document snapshot in the chain.
 * @returns Document snapshot of first reference in current chain.
 */
async function getRefDocFromRefSpecChainRecursive(
  app: App,
  refChain: readonly RefSpec[],
  snapshot: DocumentSnapshot
): Promise<DocumentSnapshot> {
  const [currentRefSpec, ...nextRefChain] = refChain;

  if (currentRefSpec === undefined) {
    return snapshot;
  }

  const refId = snapshot.data?.[currentRefSpec.fieldName];

  if (typeof refId !== 'string') {
    throw Error(
      `Invalid Type: ${JSON.stringify({
        data: snapshot.data,
        fieldName: currentRefSpec.fieldName,
      })}`
    );
  }

  const currentRefDoc = await getDoc(app, currentRefSpec.collectionName, refId);

  const refDoc = getRefDocFromRefSpecChainRecursive(
    app,
    nextRefChain,
    currentRefDoc
  );

  return refDoc;
}

/**
 * Get a document referenced by a join view.
 *
 * @param app Firebase app.
 * @param joinSpec Specification of the join view.
 * @param data Data of source document of the join view.
 * @returns Document referenced.
 */
async function getRefDocFromRefSpecs(
  app: App,
  joinSpec: JoinSpec,
  data: DocumentData
): Promise<DocumentSnapshot> {
  const { firstRef, refChain } = joinSpec;
  const refId = data[firstRef.fieldName];

  if (typeof refId !== 'string') {
    throw Error(`Invalid Type: ${JSON.stringify({ data, firstRef })}`);
  }

  const firstRefDoc = await getDoc(app, firstRef.collectionName, refId);

  const refDoc = getRefDocFromRefSpecChainRecursive(app, refChain, firstRefDoc);

  return refDoc;
}

/**
 * Prefix a join name to a field name.
 *
 * @param joinName Name of the join view.
 * @param fieldName Field name to prefix.
 * @returns Field name prefixed by join name.
 */
function prefixJoinName(joinName: string, fieldName: string): string {
  const prefixedFieldName = `${joinName}_${fieldName}`;
  return prefixedFieldName;
}

/**
 * Make refId field name of a join view.
 *
 * @param joinName Name of the join view.
 * @returns Name of refId field of the view.
 */
function makeRefIdFieldName(joinName: string): string {
  return prefixJoinName(joinName, 'id');
}

/**
 * Creates document data with fields name prefixed by join name.
 *
 * @param docData Document data to be process.
 * @param joinName Name of the join view
 * @returns Document data with prefixed fields name.
 */
function prefixJoinNameOnDocData(
  docData: DocumentData,
  joinName: string
): DocumentData {
  return mapKeys(docData, (_, fieldName) =>
    prefixJoinName(joinName, fieldName)
  );
}

/**
 * Materialize join view data from a specification.
 *
 * @param app Firebase app.
 * @param srcDocData Source document data of the join view.
 * @param spec Materialization specification.
 * @returns Materialized join view data.
 */
async function materializeJoinData(
  app: App,
  srcDocData: DocumentData,
  joinName: string,
  spec: JoinSpec
): Promise<DocumentData> {
  const refDoc = await getRefDocFromRefSpecs(app, spec, srcDocData);

  const selectedFieldDocData = pick(refDoc.data, spec.selectedFieldNames);
  const compactDocData = compactObject(selectedFieldDocData);

  const prefixedData = prefixJoinNameOnDocData(compactDocData, joinName);

  const refIdFieldName = makeRefIdFieldName(joinName);

  const docDataWithRefId = {
    ...prefixedData,
    [refIdFieldName]: refDoc.id,
  };

  return docDataWithRefId;
}

/**
 * Maps array of join view specification into array of materialized data.
 *
 * @param app Firebase app.
 * @param srcDocData Source document data of the join view.
 * @param specs Array of join view specification.
 * @returns Array of materialized datas.
 */
export async function materializeJoinViewData(
  app: App,
  srcDocData: DocumentData,
  specs: Dict<JoinSpec>
): Promise<DocumentData> {
  const docDataPromises = Object.entries(specs).map(([joinName, spec]) =>
    materializeJoinData(app, srcDocData, joinName, spec)
  );

  const docDataArray = await Promise.all(docDataPromises);

  const docData = mergeObjectArray(docDataArray);

  return docData;
}

/**
 * Get collection name of the join view, which is the latest collection in the
 * chain.
 *
 * @param spec Specification of the view.
 * @returns Name of the view's reference collection.
 */
function makeJoinRefCollectionName({ refChain, firstRef }: JoinSpec): string {
  return (
    refChain[refChain.length - 1]?.collectionName ?? firstRef.collectionName
  );
}

/**
 * Make a trigger that runs on update of the source document referenced by the
 * join view. The trigger will update all document with join view(s) referencing
 * to the source document.
 *
 * @param app Firebase app.
 * @param collectionName Name of the view's collection.
 * @param viewName Name of the view.
 * @param spec Specification of the join view.
 * @returns Trigger that runs on source document update.
 */
function makeOnJoinRefDocUpdatedTrigger(
  app: App,
  collectionName: string,
  viewName: string,
  joinName: string,
  spec: JoinSpec
): OnUpdateTrigger {
  const refCollectionName = makeJoinRefCollectionName(spec);

  return onUpdateTrigger(refCollectionName, async (refDoc) => {
    const allDocDataUpdate = getDocDataChange(refDoc.data);
    const docDataUpdate = pick(allDocDataUpdate, spec.selectedFieldNames);

    if (isEmpty(docDataUpdate)) {
      return;
    }

    const prefixedDocDataUpdate = prefixJoinNameOnDocData(
      docDataUpdate,
      joinName
    );
    const refIdFieldName = makeRefIdFieldName(joinName);

    const viewCollectionName = getViewCollectionName(collectionName, viewName);

    const referrerViews = await getCollection(
      app,
      viewCollectionName,
      (collection) => collection.where(refIdFieldName, '==', refDoc.id)
    );

    const referrerViewsUpdates = referrerViews.docs.map((doc) =>
      updateDoc(app, viewCollectionName, doc.id, prefixedDocDataUpdate)
    );

    const promisesResult = await Promise.allSettled(referrerViewsUpdates);

    throwRejectedPromises(promisesResult);
  });
}

/**
 * Create triggers that run on update of documents that referenecd by a
 * collection's join views.
 *
 * @param app Firebase app.
 * @param collectionName Name of the collection.
 * @param viewName Name of the view.
 * @param joinSpecs Specifications of the collection's join views.
 * @returns Dictionary of triggers that run on join view's referenced document
 * updated.
 */
export function onJoinRefDocUpdated(
  app: App,
  collectionName: string,
  viewName: string,
  joinSpecs: Dict<JoinSpec>
): Dict<OnUpdateTrigger> {
  return mapValues(joinSpecs, (joinSpec, joinName) =>
    makeOnJoinRefDocUpdatedTrigger(
      app,
      collectionName,
      viewName,
      joinName,
      joinSpec
    )
  );
}
