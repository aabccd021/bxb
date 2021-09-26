import * as _ from 'lodash';
import * as admin from 'firebase-admin';
import { Collection, JoinSpec, RefSpec } from './type';
import * as functions from 'firebase-functions';
import { mapValues } from 'lodash';

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
  firstRef: RefSpec,
  refChain: readonly RefSpec[],
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

function addRefPrefixToFieldNames(
  firstRef: RefSpec,
  refChain: readonly RefSpec[],
  data: FirebaseFirestore.DocumentData
): FirebaseFirestore.DocumentData {
  const refChainFieldNames = refChain.map(({ fieldName }) => {
    fieldName;
  });
  const refFieldNames = [firstRef.fieldName, ...refChainFieldNames];
  const prefix = refFieldNames.join('_');

  const prefixedData = _.mapKeys(
    data,
    (_, fieldName) => `${prefix}_${fieldName}`
  );

  return prefixedData;
}

async function getDocDataFromJoinSpec(
  data: FirebaseFirestore.DocumentData,
  { firstRef, refChain, selectedFieldNames }: JoinSpec
): Promise<FirebaseFirestore.DocumentData> {
  const refDoc = await getRefDocFromRefSpecs(firstRef, refChain, data);

  const selectedDocData = _.pick(refDoc.data(), selectedFieldNames);

  const docDataWithId = {
    ...selectedDocData,
    id: refDoc.id,
  };

  const prefixedData = addRefPrefixToFieldNames(
    firstRef,
    refChain,
    docDataWithId
  );

  return prefixedData;
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

type FirestoreDataType = string;

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
): FirebaseFirestore.DocumentData | undefined {
  const docDataDiff = mapValues(beforeDocData, (beforeFieldData, fieldName) => {
    const afterFieldData = afterDocData[fieldName];
    const fieldDiff = getFieldDiff(beforeFieldData, afterFieldData);
    return fieldDiff;
  });

  const compactDocDataDiff = compactObject(docDataDiff);

  return compactDocDataDiff;
}

export function getTrigger(collections: readonly Collection[]): void {
  collections.map(({ collectionName, view }) =>
    view?.map(({ viewName, selectedFieldNames, joinSpecs }) => {
      const viewCollectionRef = admin
        .firestore()
        .collection(`${collectionName}_${viewName}`);

      const srcDocFunction = functions.firestore.document(
        `${collectionName}/{docId}`
      );

      const onSrcCreated = srcDocFunction.onCreate(async (srcDoc) => {
        const selectedDocData = _.pick(srcDoc.data(), selectedFieldNames);

        const joinedDocData = await getJoinedDocData(srcDoc.data(), joinSpecs);

        const viewDocData: FirebaseFirestore.DocumentData = {
          ...selectedDocData,
          ...joinedDocData,
        };

        const viewDocId = srcDoc.id;

        await viewCollectionRef.doc(viewDocId).create(viewDocData);
      });

      const onSrcDeleted = srcDocFunction.onDelete(async (srcDoc) => {
        const viewDocId = srcDoc.id;

        await viewCollectionRef.doc(viewDocId).delete();
      });

      return {
        onSrcCreated,
        onSrcDeleted,
      };
    })
  );
}
