import * as _ from 'lodash';
import * as admin from 'firebase-admin';
import { Collection, JoinSpec } from './type';
import * as functions from 'firebase-functions';

function mergeObjectArray<T>(
  objectArray: readonly { readonly [key: string]: T }[]
): { readonly [key: string]: T } {
  return objectArray.reduce(
    (acc, object) => ({
      ...acc,
      ...object,
    }),
    {}
  );
}

function getSelectedDocData(
  data: FirebaseFirestore.DocumentData,
  selectedFieldNames: readonly string[]
): FirebaseFirestore.DocumentData {
  const selectedDocData = _.pick(data, selectedFieldNames);
  return selectedDocData;
}

async function getDocDataFromJoinSpec(
  data: FirebaseFirestore.DocumentData,
  { refCollectionName, refFieldName, selectedFieldNames }: JoinSpec
): Promise<FirebaseFirestore.DocumentData> {
  const refId = data[refFieldName];

  const refDoc = await admin
    .firestore()
    .collection(refCollectionName)
    .doc(refId)
    .get();

  const selectedDocData = _.pick(refDoc.data(), selectedFieldNames);
  return selectedDocData;
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

      const onCreateFunction = functions.firestore
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

      return onCreateFunction;
    })
  );
}
