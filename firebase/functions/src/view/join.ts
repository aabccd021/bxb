import { Dictionary, isEmpty, mapKeys, pick } from 'lodash';

import { DocumentData, DocumentSnapshot, JoinSpec, RefSpec } from '../type';
import {
  compactObject,
  getDocDataChange,
  getViewCollectionName,
  throwRejectedPromises,
  mergeObjectArray,
} from '../util';
import { getDoc, getCollection, updateDoc } from '../wrapper/firebase-admin';
import {
  onUpdateTrigger,
  OnUpdateTrigger,
} from '../wrapper/firebase-functions';

/**
 * Recursively returns a document referred by join view. Returns latest document
 * snapshot if it is the last document in the whole chain.
 *
 * @param refChain Chain of reference to the document.
 * @param snapshot Latest document snapshot in the chain.
 * @returns Document snapshot of first reference in current chain.
 */
async function getRefDocFromRefSpecChainRecursive(
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

  const currentRefDoc = await getDoc(currentRefSpec.collectionName, refId);

  const refDoc = getRefDocFromRefSpecChainRecursive(
    nextRefChain,
    currentRefDoc
  );

  return refDoc;
}

/**
 * Get a document referenced by a join view.
 *
 * @param joinSpec Specification of the join view.
 * @param data Data of source document of the join view.
 * @returns Document referenced.
 */
async function getRefDocFromRefSpecs(
  joinSpec: JoinSpec,
  data: DocumentData
): Promise<DocumentSnapshot> {
  const { firstRef, refChain } = joinSpec;
  const refId = data[firstRef.fieldName];

  if (typeof refId !== 'string') {
    throw Error(`Invalid Type: ${JSON.stringify({ data, firstRef })}`);
  }

  const firstRefDoc = await getDoc(firstRef.collectionName, refId);

  const refDoc = getRefDocFromRefSpecChainRecursive(refChain, firstRefDoc);

  return refDoc;
}

/**
 * Creates join name of a join spec.
 *
 * @example
 * const joinSpec = {
 *   firstRef: {
 *     collectionName: 'tweet',
 *     fieldName: 'repliedTweet',
 *   },
 *   refChain: [
 *     {
 *       collectionName: 'user',
 *       fieldName: 'owner',
 *     },
 *   ],
 * }
 * const joinName = makeJoinName(joinSpec)
 * // joinName => 'repliedTweet_owner'
 *
 * @param joinSpec Join specification to process.
 * @returns Name of the join.
 */
function makeJoinName(joinSpec: JoinSpec): string {
  const { refChain, firstRef } = joinSpec;
  const refChainFieldNames = refChain.map(({ fieldName }) => {
    fieldName;
  });
  const refFieldNames = [firstRef.fieldName, ...refChainFieldNames];
  const joinName = refFieldNames.join('_');

  return joinName;
}

/**
 * Prefix a join name to a field name.
 *
 * @param joinSpec Specification of the view.
 * @param fieldName Field name to prefix.
 * @returns Field name prefixed by join name.
 */
function prefixJoinName(joinSpec: JoinSpec, fieldName: string): string {
  const joinName = makeJoinName(joinSpec);
  const prefixedFieldName = `${joinName}_${fieldName}`;
  return prefixedFieldName;
}

/**
 * Make refId field name of a join view.
 *
 * @param spec Specification of the view.
 * @returns Name of refId field of the view.
 */
function makeRefIdFieldName(spec: JoinSpec): string {
  return prefixJoinName(spec, 'id');
}

/**
 * Creates document data with fields name prefixed by join name.
 *
 * @param docData Document data to be process.
 * @param spec Specification of the join view.
 * @returns Document data with prefixed fields name.
 */
function prefixJoinNameOnDocData(
  docData: DocumentData,
  spec: JoinSpec
): DocumentData {
  return mapKeys(docData, (_, fieldName) => prefixJoinName(spec, fieldName));
}

/**
 * Materialize join view data from a specification.
 *
 * @param srcDocData Source document data of the join view.
 * @param spec Materialization specification.
 * @returns Materialized join view data.
 */
async function materializeJoinData(
  srcDocData: DocumentData,
  spec: JoinSpec
): Promise<DocumentData> {
  const refDoc = await getRefDocFromRefSpecs(spec, srcDocData);

  const selectedFieldDocData = pick(refDoc.data, spec.selectedFieldNames);
  const compactDocData = compactObject(selectedFieldDocData);

  const prefixedData = prefixJoinNameOnDocData(compactDocData, spec);

  const refIdFieldName = makeRefIdFieldName(spec);

  const docDataWithRefId = {
    ...prefixedData,
    [refIdFieldName]: refDoc.id,
  };

  return docDataWithRefId;
}

/**
 * Maps array of join view specification into array of materialized data.
 *
 * @param srcDocData Source document data of the join view.
 * @param specs Array of join view specification.
 * @returns Array of materialized datas.
 */
export async function materializeJoinViewData(
  srcDocData: DocumentData,
  specs: readonly JoinSpec[]
): Promise<DocumentData> {
  const docDataPromises = specs.map((spec) =>
    materializeJoinData(srcDocData, spec)
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
 * @param collectionName Name of the view's collection.
 * @param viewName Name of the view.
 * @param spec Specification of the join view.
 * @returns Trigger that runs on source document update.
 */
function makeOnJoinRefDocUpdatedTrigger(
  collectionName: string,
  viewName: string,
  spec: JoinSpec
): OnUpdateTrigger {
  const refCollectionName = makeJoinRefCollectionName(spec);

  return onUpdateTrigger(refCollectionName, async (refDoc) => {
    const allDocDataUpdate = getDocDataChange(refDoc.data);
    const docDataUpdate = pick(allDocDataUpdate, spec.selectedFieldNames);

    if (isEmpty(docDataUpdate)) {
      return;
    }

    const prefixedDocDataUpdate = prefixJoinNameOnDocData(docDataUpdate, spec);
    const refIdFieldName = makeRefIdFieldName(spec);

    const viewCollectionName = getViewCollectionName(collectionName, viewName);

    const referrerViews = await getCollection(
      viewCollectionName,
      (collection) => collection.where(refIdFieldName, '==', refDoc.id)
    );

    const referrerViewsUpdates = referrerViews.docs.map((doc) =>
      updateDoc(viewCollectionName, doc.id, prefixedDocDataUpdate)
    );

    const promisesResult = await Promise.allSettled(referrerViewsUpdates);

    throwRejectedPromises(promisesResult);
  });
}

/**
 * Create triggers that run on update of documents that referenecd by a
 * collection's join views.
 *
 * @param collectionName Name of the collection.
 * @param viewName Name of the view.
 * @param JoinSpecs Specifications of the collection's join views.
 * @returns Dictionary of triggers that run on join view's referenced document
 * updated.
 */
export function onJoinRefDocUpdated(
  collectionName: string,
  viewName: string,
  JoinSpecs: readonly JoinSpec[]
): Dictionary<OnUpdateTrigger> {
  const triggerEntries = JoinSpecs.map((spec) => {
    const joinName = makeJoinName(spec);
    const trigger = makeOnJoinRefDocUpdatedTrigger(
      collectionName,
      viewName,
      spec
    );
    const triggerEntry: readonly [string, OnUpdateTrigger] = [
      joinName,
      trigger,
    ];
    return triggerEntry;
  });

  const updateTriggers = Object.fromEntries(triggerEntries);
  return updateTriggers;
}
