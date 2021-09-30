import { Dictionary, isEmpty, mapKeys, pick } from 'lodash';

import { DocumentData, DocumentSnapshot, JoinSpec, RefSpec } from '../type';
import {
  compactObject,
  getDocDataChange,
  getViewCollectionName,
  logRejectedPromises,
  mergeObjectArray,
} from '../util';
import { getCollection, getDoc, updateDoc } from '../wrapper/firebase-admin';
import { onUpdate, OnUpdateTrigger } from '../wrapper/firebase-functions';

/**
 * Recursively returns a document referred by join view.
 * Returns latest document snapshot if it is the last document in the whole chain.
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
 * @param spec Specification of the join view.
 * @param data Data of source document of the join view.
 * @returns Document referenced.
 */
async function getRefDocFromRefSpecs(
  spec: JoinSpec,
  data: DocumentData
): Promise<DocumentSnapshot> {
  const { firstRef, refChain } = spec;
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
 * const joinName = getJoinName(joinSpec)
 * // joinName => 'repliedTweet_owner'
 *
 * @param joinSpec Join specification to process.
 * @returns Name of the join.
 */
function getJoinName(joinSpec: JoinSpec): string {
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
 * @param spec Join specification which the join name is created from.
 * @param fieldName Field name to prefix.
 * @returns Field name prefixed by join name.
 */
function prefixJoinName(spec: JoinSpec, fieldName: string): string {
  const joinName = getJoinName(spec);
  const prefixedFieldName = `${joinName}_${fieldName}`;
  return prefixedFieldName;
}

/**
 * Get id field name of a join view.
 *
 * @param spec Specification of the view.
 * @returns Id field name.
 */
function getRefIdFieldName(spec: JoinSpec): string {
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
 * Create (materialize) join view data from a specification.
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

  const refIdFieldName = getRefIdFieldName(spec);

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
export async function getMaterializedJoinDatas(
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

function getOnJoinRefUpdateTrigger(
  collectionName: string,
  viewName: string,
  spec: JoinSpec
): OnUpdateTrigger {
  const { refChain, firstRef, selectedFieldNames } = spec;

  // get latest collection in the chain
  const refCollectionName =
    refChain[refChain.length - 1]?.collectionName ?? firstRef.collectionName;

  const updateFunction = onUpdate(refCollectionName, async (refDoc) => {
    const allDocDataUpdate = getDocDataChange(refDoc.data);
    const docDataUpdate = pick(allDocDataUpdate, selectedFieldNames);

    if (!isEmpty(docDataUpdate)) {
      const prefixedDocDataUpdate = prefixJoinNameOnDocData(
        docDataUpdate,
        spec
      );
      const refIdFieldName = getRefIdFieldName(spec);

      const viewCollectionName = getViewCollectionName(
        collectionName,
        viewName
      );
      const referrerViewDocsSnapshot = await getCollection(
        viewCollectionName,
        (collection) => collection.where(refIdFieldName, '==', refDoc.id)
      );

      const referrerViewDocsUpdates = referrerViewDocsSnapshot.docs.map((doc) =>
        updateDoc(viewCollectionName, doc.id, prefixedDocDataUpdate)
      );

      const result = await Promise.allSettled(referrerViewDocsUpdates);

      logRejectedPromises(result);
    }
  });

  return updateFunction;
}

export function onJoinRefDocUpdated(
  collectionName: string,
  viewName: string,
  specs: readonly JoinSpec[]
): Dictionary<OnUpdateTrigger> {
  const updateFunctionEntries = specs.map((spec) => {
    const joinName = getJoinName(spec);
    const updateFunction = getOnJoinRefUpdateTrigger(
      collectionName,
      viewName,
      spec
    );
    const entry: readonly [string, OnUpdateTrigger] = [
      joinName,
      updateFunction,
    ];
    return entry;
  });

  const updateFunctions = Object.fromEntries(updateFunctionEntries);
  return updateFunctions;
}
