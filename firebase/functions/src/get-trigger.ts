import { chain, Dictionary, isEmpty, mapKeys, mapValues, pick } from 'lodash';
import {
  createDoc,
  deleteDoc,
  getCollection,
  getDoc,
  updateDoc,
} from './firebase-admin';
import {
  DocumentDataChange,
  onCreate,
  OnCreateTrigger,
  onDelete,
  OnDeleteTrigger,
  onUpdate,
  OnUpdateTrigger,
} from './firebase-functions';
import {
  Collection,
  CollectionTrigger,
  DocumentData,
  FieldSpec,
  FirestoreDataType,
  JoinSpec,
  RefSpec,
  View,
  ViewTrigger,
} from './type';

/**
 * Throw rejected promises from array of settled promises.
 *
 * @param promiseResults The array of settled promises to process
 */
function logRejectedPromises(
  promiseResults: readonly PromiseSettledResult<unknown>[]
  // eslint-disable-next-line functional/no-return-void
): void {
  const errors = chain(promiseResults)
    .map((result) => (result.status === 'rejected' ? result.reason : undefined))
    .compact()
    .value();

  if (!isEmpty(errors)) {
    throw Error(JSON.stringify(errors));
  }
}

/**
 * Create a object by merging array of objects.
 *
 * @param objectArray The array of object to merge.
 * @returns The merged object
 */
function mergeObjectArray<T>(
  objectArray: readonly { readonly [key: string]: T }[]
): { readonly [key: string]: T } {
  return objectArray.reduce((acc, object) => ({ ...acc, ...object }), {});
}

/**
 * Create an object with all undefined values removed.
 *
 * @example
 * const obejectWithUndefined = {
 *   definedValue: '',
 *   undefinedValue: undefined
 *  }
 * const result = compactObject(objectWithUndefined)
 * // result => { definedValue: '' }
 *
 *
 * @param object The object to compact.
 * @returns Returns the new object without undefined values.
 */
function compactObject<T>(object: Dictionary<T | undefined>): Dictionary<T> {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      return {
        ...acc,
        [key]: value,
      };
    }
    return acc;
  }, {});
}

/**
 * Recursively returns a document referred by join view.
 * Returns latest document snapshot if it is the last document in the whole chain.
 *
 * @param refChain Chain of reference to the document.
 * @param snapshot Latest document snapshot in the chain.
 * @returns Document snapshot of first reference in current chain.
 */
async function getRefDocFromRefSpecChainRec(
  refChain: readonly RefSpec[],
  snapshot: FirebaseFirestore.DocumentSnapshot<DocumentData>
): Promise<FirebaseFirestore.DocumentSnapshot<DocumentData>> {
  const [currentRefSpec, ...nextRefChain] = refChain;

  if (currentRefSpec === undefined) {
    return snapshot;
  }

  const refId = snapshot.data()?.[currentRefSpec.fieldName];

  if (typeof refId !== 'string') {
    throw Error(
      `Invalid Type: ${JSON.stringify({
        data: snapshot.data(),
        fieldName: currentRefSpec.fieldName,
      })}`
    );
  }

  const currentRefDoc = await getDoc(currentRefSpec.collectionName, refId);

  const refDoc = getRefDocFromRefSpecChainRec(nextRefChain, currentRefDoc);

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
): Promise<FirebaseFirestore.DocumentSnapshot<DocumentData>> {
  const { firstRef, refChain } = spec;
  const refId = data[firstRef.fieldName];

  if (typeof refId !== 'string') {
    throw Error(`Invalid Type: ${JSON.stringify({ data, firstRef })}`);
  }

  const firstRefDoc = await getDoc(firstRef.collectionName, refId);

  const refDoc = getRefDocFromRefSpecChainRec(refChain, firstRefDoc);

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

  const selectedFieldDocData = pick(refDoc.data(), spec.selectedFieldNames);
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
async function getMaterializedJoinDatas(
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
 * Get value difference before and after a change.
 * Returns undefined if value not changed.
 *
 * @example
 * const change1 = getValueChange('foo', 'bar')
 * // change1 => 'bar'
 *
 * @example
 * const change2 = getValueChange('lorem', 'lorem')
 * // change2 => undefined
 *
 * @param beforeValue Value before change.
 * @param afterValue Value after change.
 * @returns Difference between before and after.
 */
function getValueChange(
  beforeValue: FirestoreDataType,
  afterValue: FirestoreDataType
): FirestoreDataType | undefined {
  if (typeof beforeValue === 'string' && typeof afterValue === 'string') {
    if (beforeValue !== afterValue) {
      return afterValue;
    }
    return undefined;
  }
  throw Error(JSON.stringify({ beforeValue, afterValue }));
}

/**
 *
 * @param beforeDocData
 * @param afterDocData
 * @returns
 */
function getDocDataChange({ before, after }: DocumentDataChange): DocumentData {
  const docDataDiff = mapValues(before, (beforeFieldData, fieldName) => {
    const afterFieldData = after[fieldName];

    // undefined (optional) field is not supported
    if (afterFieldData === undefined) {
      throw Error(JSON.stringify({ before, afterFieldData, fieldName }));
    }

    const fieldDiff = getValueChange(beforeFieldData, afterFieldData);
    return fieldDiff;
  });

  const compactDocDataDiff = compactObject(docDataDiff);

  return compactDocDataDiff;
}

function getViewCollectionName(
  collectionName: string,
  viewName: string
): string {
  return `${collectionName}_${viewName}`;
}

async function materializeView(
  srcDocData: DocumentData,
  selectedFieldNames: readonly string[],
  joinSpecs: readonly JoinSpec[]
): Promise<DocumentData> {
  const selectedDocData = pick(srcDocData, selectedFieldNames);

  const joinedDocData = await getMaterializedJoinDatas(srcDocData, joinSpecs);

  const viewDocData: DocumentData = {
    ...selectedDocData,
    ...joinedDocData,
  };
  return viewDocData;
}

export async function createViewDoc(
  collectionName: string,
  viewName: string,
  srcDoc: FirebaseFirestore.QueryDocumentSnapshot,
  selectedFieldNames: readonly string[],
  joinSpecs: readonly JoinSpec[]
): Promise<FirebaseFirestore.WriteResult> {
  const viewDocData = await materializeView(
    srcDoc.data(),
    selectedFieldNames,
    joinSpecs
  );
  const viewDocId = srcDoc.id;
  const viewCollectionName = getViewCollectionName(collectionName, viewName);
  return createDoc(viewCollectionName, viewDocId, viewDocData);
}

function getOnSrcCreatedFunction(
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

function getOnSrcUpdateFunction(
  collectionName: string,
  viewName: string,
  selectedFieldNames: readonly string[]
): OnUpdateTrigger {
  const onUpdateFunction = onUpdate(collectionName, async (srcDoc) => {
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
  return onUpdateFunction;
}

function getOnJoinRefUpdateFunction(
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

      const referrerViewDocsUpdates = referrerViewDocsSnapshot.docs.map(
        ({ ref }) => ref.update(prefixedDocDataUpdate)
      );

      const result = await Promise.allSettled(referrerViewDocsUpdates);

      logRejectedPromises(result);
    }
  });

  return updateFunction;
}

function getOnJoinRefUpdateFunctions(
  collectionName: string,
  viewName: string,
  specs: readonly JoinSpec[]
): Dictionary<OnUpdateTrigger> {
  const updateFunctionEntries = specs.map((spec) => {
    const joinName = getJoinName(spec);
    const updateFunction = getOnJoinRefUpdateFunction(
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

function getOnSrcDeletedFunction(
  collectionName: string,
  viewName: string
): OnDeleteTrigger {
  const onDeleteFunction = onDelete(collectionName, async (srcDoc) => {
    const viewDocId = srcDoc.id;

    const viewCollectionName = getViewCollectionName(collectionName, viewName);
    await deleteDoc(viewCollectionName, viewDocId);
  });
  return onDeleteFunction;
}

function getOnSrcRefDeletedFunction(
  collectionName: string,
  src: Dictionary<FieldSpec>
): Dictionary<OnDeleteTrigger | undefined> {
  return mapValues(src, (sf, sfName) => {
    if (sf.type !== 'ref') {
      return undefined;
    }
    const onDeleteFunction = onDelete(sf.refCollection, async (refDoc) => {
      const referrerSrcDocsSnapshot = await getCollection(
        collectionName,
        (collection) => collection.where(sfName, '==', refDoc.id)
      );

      const referrerDocsDeletes = referrerSrcDocsSnapshot.docs.map(({ ref }) =>
        ref.delete()
      );

      await Promise.allSettled(referrerDocsDeletes);
    });
    return onDeleteFunction;
  });
}

function getViewTriggers(
  collectionName: string,
  viewName: string,
  { selectedFieldNames, joinSpecs }: View
): ViewTrigger {
  return {
    onSrcCreated: getOnSrcCreatedFunction(
      collectionName,
      viewName,
      selectedFieldNames,
      joinSpecs
    ),
    onSrcUpdated: getOnSrcUpdateFunction(
      collectionName,
      viewName,
      selectedFieldNames
    ),
    onSrcDeleted: getOnSrcDeletedFunction(collectionName, viewName),
    onJoinRefUpdated: getOnJoinRefUpdateFunctions(
      collectionName,
      viewName,
      joinSpecs
    ),
  };
}

function getCollectionTrigger(
  { src, views }: Collection,
  collectionName: string
): CollectionTrigger {
  return {
    onRefDeleted: getOnSrcRefDeletedFunction(collectionName, src),
    view: mapValues(views, (view, viewName) =>
      getViewTriggers(collectionName, viewName, view)
    ),
  };
}

export function getTriggers(
  collections: Dictionary<Collection>
): Dictionary<CollectionTrigger> {
  return mapValues(collections, getCollectionTrigger);
}
