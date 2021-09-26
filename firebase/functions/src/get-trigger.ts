import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Dictionary, isEmpty, mapKeys, mapValues, pick } from 'lodash';
import {
  Collection,
  FieldSpec,
  FirestoreDataType,
  JoinSpec,
  OnCreateFunction,
  OnDeleteFunction,
  OnUpdateFunction,
  RefSpec,
  View,
  ViewTrigger as ViewTriggers,
} from './type';

function mergeObjectArray<T>(
  objectArray: readonly { readonly [key: string]: T }[]
): { readonly [key: string]: T } {
  return objectArray.reduce((acc, object) => ({ ...acc, ...object }), {});
}

function compactObject<T>(object: { readonly [key: string]: T | undefined }): {
  readonly [key: string]: T;
} {
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

async function getRefDocFromRefSpecChainRec(
  refChain: readonly RefSpec[],
  snapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>> {
  const [currentRefSpec, ...nextRefChain] = refChain;

  if (currentRefSpec === undefined) {
    return snapshot;
  }

  const refId = snapshot.data()?.[currentRefSpec.fieldName];

  const currentRefDoc = await admin
    .firestore()
    .collection(currentRefSpec.collectionName)
    .doc(refId)
    .get();

  const refDoc = getRefDocFromRefSpecChainRec(nextRefChain, currentRefDoc);

  return refDoc;
}

async function getRefDocFromRefSpecs(
  { firstRef, refChain }: JoinSpec,
  data: FirebaseFirestore.DocumentData
): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>> {
  const refId = data[firstRef.fieldName];

  const firstRefDoc = await admin
    .firestore()
    .collection(firstRef.collectionName)
    .doc(refId)
    .get();

  const refDoc = getRefDocFromRefSpecChainRec(refChain, firstRefDoc);

  return refDoc;
}

function getJoinName({ refChain, firstRef }: JoinSpec): string {
  const refChainFieldNames = refChain.map(({ fieldName }) => {
    fieldName;
  });
  const refFieldNames = [firstRef.fieldName, ...refChainFieldNames];
  const joinName = refFieldNames.join('_');

  return joinName;
}

function prefixJoinName(spec: JoinSpec, fieldName: string): string {
  const joinName = getJoinName(spec);
  const prefixedFieldName = `${joinName}_${fieldName}`;
  return prefixedFieldName;
}

function getRefIdFieldName(spec: JoinSpec): string {
  return prefixJoinName(spec, 'id');
}

function prefixJoinNameOnDocData(
  docData: FirebaseFirestore.DocumentData,
  spec: JoinSpec
): FirebaseFirestore.DocumentData {
  return mapKeys(docData, (_, fieldName) => prefixJoinName(spec, fieldName));
}

async function getDocDataFromJoinSpec(
  data: FirebaseFirestore.DocumentData,
  spec: JoinSpec
): Promise<FirebaseFirestore.DocumentData> {
  const refDoc = await getRefDocFromRefSpecs(spec, data);

  const docData = pick(refDoc.data(), spec.selectedFieldNames);

  const prefixedData = prefixJoinNameOnDocData(docData, spec);

  const refIdFieldName = getRefIdFieldName(spec);

  const docDataWithRefId = {
    ...prefixedData,
    [refIdFieldName]: refDoc.id,
  };

  return docDataWithRefId;
}

async function getJoinedDocData(
  data: FirebaseFirestore.DocumentData,
  specs: readonly JoinSpec[]
): Promise<FirebaseFirestore.DocumentData> {
  const docDataPromises = specs.map((spec) =>
    getDocDataFromJoinSpec(data, spec)
  );

  const docDataArray = await Promise.all(docDataPromises);

  const docData = mergeObjectArray(docDataArray);

  return docData;
}

function getFieldDiff(
  before: unknown,
  after: unknown
): FirestoreDataType | undefined {
  if (typeof before === 'string' && typeof after === 'string') {
    if (before !== after) {
      return after;
    }
    return undefined;
  }

  functions.logger.error('unknown type', { before, after });
  throw Error();
}

function getDocDataDiff(
  beforeDocData: FirebaseFirestore.DocumentData,
  afterDocData: FirebaseFirestore.DocumentData
): FirebaseFirestore.DocumentData {
  const docDataDiff = mapValues(beforeDocData, (beforeFieldData, fieldName) => {
    const afterFieldData = afterDocData[fieldName];
    const fieldDiff = getFieldDiff(beforeFieldData, afterFieldData);
    return fieldDiff;
  });

  const compactDocDataDiff = compactObject(docDataDiff);

  return compactDocDataDiff;
}

function getSrcDocFunction(
  collectionName: string
): functions.firestore.DocumentBuilder {
  return functions.firestore.document(`${collectionName}/{docId}`);
}

function getViewCollectionRef(
  collectionName: string,
  viewName: string
): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> {
  return admin.firestore().collection(`${collectionName}_${viewName}`);
}

function getOnSrcCreatedFunction(
  collectionName: string,
  viewName: string,
  selectedFieldNames: readonly string[],
  joinSpecs: readonly JoinSpec[]
): OnCreateFunction {
  const srcDocFunction = getSrcDocFunction(collectionName);
  const onCreateFunction = srcDocFunction.onCreate(async (srcDoc) => {
    const selectedDocData = pick(srcDoc.data(), selectedFieldNames);

    const joinedDocData = await getJoinedDocData(srcDoc.data(), joinSpecs);

    const viewDocData: FirebaseFirestore.DocumentData = {
      ...selectedDocData,
      ...joinedDocData,
    };

    const viewDocId = srcDoc.id;

    const viewCollectionRef = getViewCollectionRef(collectionName, viewName);
    await viewCollectionRef.doc(viewDocId).create(viewDocData);
  });
  return onCreateFunction;
}

function getOnSrcUpdateFunction(
  collectionName: string,
  viewName: string,
  selectedFieldNames: readonly string[]
): OnUpdateFunction {
  const srcDocFunction = getSrcDocFunction(collectionName);
  const onUpdateFunction = srcDocFunction.onUpdate(
    async ({ before: srcDocBefore, after: scrDocAfter }) => {
      const allDocDataUpdate = getDocDataDiff(srcDocBefore, scrDocAfter);
      const docDataUpdate = pick(allDocDataUpdate, selectedFieldNames);

      if (!isEmpty(docDataUpdate)) {
        const viewDocId = scrDocAfter.id;
        const viewCollectionRef = getViewCollectionRef(
          collectionName,
          viewName
        );
        await viewCollectionRef.doc(viewDocId).update(docDataUpdate);
      }
    }
  );
  return onUpdateFunction;
}

function getOnJoinRefUpdateFunction(
  collectionName: string,
  viewName: string,
  spec: JoinSpec
): OnUpdateFunction {
  const { refChain, firstRef, selectedFieldNames } = spec;

  // get latest collection in the chain
  const refCollectionName =
    refChain[refChain.length - 1]?.collectionName ?? firstRef.collectionName;

  const updateFunction = functions.firestore
    .document(`${refCollectionName}/{documentId}`)
    .onUpdate(async ({ before: refDocBefore, after: refDocAfter }) => {
      const allDocDataUpdate = getDocDataDiff(refDocBefore, refDocAfter);
      const docDataUpdate = pick(allDocDataUpdate, selectedFieldNames);

      if (!isEmpty(docDataUpdate)) {
        const prefixedDocDataUpdate = prefixJoinNameOnDocData(
          docDataUpdate,
          spec
        );
        const refIdFieldName = getRefIdFieldName(spec);
        const viewCollectionRef = getViewCollectionRef(
          collectionName,
          viewName
        );
        const referViewDocsSnapshot = await viewCollectionRef
          .where(refIdFieldName, '==', refDocAfter.id)
          .get();

        const referViewDocsUpdates = referViewDocsSnapshot.docs.map(({ ref }) =>
          ref.update(prefixedDocDataUpdate)
        );

        await Promise.allSettled(referViewDocsUpdates);
      }
    });

  return updateFunction;
}

function getOnJoinRefUpdateFunctions(
  collectionName: string,
  viewName: string,
  specs: readonly JoinSpec[]
): Dictionary<OnUpdateFunction> {
  const updateFunctionEntries = specs.map((spec) => {
    const joinName = getJoinName(spec);
    const updateFunction = getOnJoinRefUpdateFunction(
      collectionName,
      viewName,
      spec
    );
    const entry: readonly [string, OnUpdateFunction] = [
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
): OnDeleteFunction {
  const srcDocFunction = getSrcDocFunction(collectionName);
  const onDeleteFunction = srcDocFunction.onDelete(async (srcDoc) => {
    const viewDocId = srcDoc.id;

    const viewCollectionRef = getViewCollectionRef(collectionName, viewName);
    await viewCollectionRef.doc(viewDocId).delete();
  });
  return onDeleteFunction;
}

function getOnSrcRefDeletedFunction(
  collectionName: string,
  src: Dictionary<FieldSpec>
): Dictionary<OnDeleteFunction | undefined> {
  return mapValues(src, (sf, sfName) => {
    if (sf.type !== 'ref') {
      return undefined;
    }
    const onDeleteFunction = functions.firestore
      .document(`${sf.refCollection}/{documentId}`)
      .onDelete(async (refDoc) => {
        const referSrcDocsSnapshot = await admin
          .firestore()
          .collection(collectionName)
          .where(sfName, '==', refDoc.id)
          .get();

        const referDocsDeletes = referSrcDocsSnapshot.docs.map(({ ref }) =>
          ref.delete()
        );

        await Promise.allSettled(referDocsDeletes);
      });
    return onDeleteFunction;
  });
}

function getViewTriggers(
  collectionName: string,
  viewName: string,
  src: Dictionary<FieldSpec>,
  { selectedFieldNames, joinSpecs }: View
): ViewTriggers {
  return {
    createViewOnSrcCreated: getOnSrcCreatedFunction(
      collectionName,
      viewName,
      selectedFieldNames,
      joinSpecs
    ),
    updateViewOnSrcUpdated: getOnSrcUpdateFunction(
      collectionName,
      viewName,
      selectedFieldNames
    ),
    deleteViewOnSrcDeleted: getOnSrcDeletedFunction(collectionName, viewName),
    deleteSrcOnRefDeleted: getOnSrcRefDeletedFunction(collectionName, src),
    updateViewOnJoinRefUpdated: getOnJoinRefUpdateFunctions(
      collectionName,
      viewName,
      joinSpecs
    ),
  };
}

export function getTriggers(
  collections: Dictionary<Collection>
): Dictionary<Dictionary<ViewTriggers>> {
  return mapValues(collections, ({ views, src }, collectionName) =>
    mapValues(views, (view, viewName) =>
      getViewTriggers(collectionName, viewName, src, view)
    )
  );
}
