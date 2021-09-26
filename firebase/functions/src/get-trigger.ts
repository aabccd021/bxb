import * as _ from 'lodash';
import * as admin from 'firebase-admin';
import { Collection, JoinSpec, RefSpec } from './type';
import * as functions from 'firebase-functions';

function mergeObjectArray<T>(
  objectArray: readonly { readonly [key: string]: T }[]
): { readonly [key: string]: T } {
  return objectArray.reduce((acc, object) => ({ ...acc, ...object }), {});
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

export function getTrigger(collections: readonly Collection[]): void {
  collections.map(({ collectionName, view }) =>
    view?.map(({ viewName, selectedFieldNames, joinSpecs }) => {
      const viewCollectionRef = admin
        .firestore()
        .collection(`${collectionName}_${viewName}`);

      const onSrcCreated = functions.firestore
        .document(`${collectionName}/{docId}`)
        .onCreate(async (srcDoc) => {
          const selectedDocData = _.pick(srcDoc.data(), selectedFieldNames);

          const joinedDocData = await getJoinedDocData(
            srcDoc.data(),
            joinSpecs
          );

          const viewDocData: FirebaseFirestore.DocumentData = {
            ...selectedDocData,
            ...joinedDocData,
          };

          const viewDocId = srcDoc.id;

          await viewCollectionRef.doc(viewDocId).create(viewDocData);
        });

      return onSrcCreated;
    })
  );
}
