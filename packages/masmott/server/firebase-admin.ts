/* eslint-disable no-restricted-imports */
import {
  CollectionReference,
  DocumentReference,
  FieldValue,
  getFirestore,
  GrpcStatus,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import { flow } from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/ReadonlyArray';
import * as T from 'fp-ts/lib/Task';
import { DocumentData, DocumentSnapshot } from '../src';
import { CollectionQuery, FirestoreDocumentSnapshot, WriteDocumentData } from './types';
import { wrapFirebaseSnapshot } from './util';

export const firestore = { FieldValue, GrpcStatus };

export const toCollectionRef = (collectionName: string): CollectionReference =>
  getFirestore().collection(collectionName);

const makeDocRef = (collectionName: string, documentId: string): DocumentReference =>
  toCollectionRef(collectionName).doc(documentId);

export const getDocument = (collectionQuery: CollectionQuery): T.Task<QuerySnapshot> =>
  collectionQuery.get;

const getSnapshotDocs = (snapshot: QuerySnapshot): readonly FirestoreDocumentSnapshot[] =>
  snapshot.docs;

export async function getDoc(
  collectionName: string,
  documentId: string
): Promise<DocumentSnapshot> {
  const snapshot = await makeDocRef(collectionName, documentId).get();
  const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
  return wrappedSnapshot;
}

export const deleteDoc_ =
  (documentId: string) =>
  (collectionName: string): T.Task<FirebaseFirestore.WriteResult> =>
    deleteDoc(collectionName)(documentId);

export const deleteDoc =
  (collectionName: string) =>
  (documentId: string): T.Task<FirebaseFirestore.WriteResult> =>
    makeDocRef(collectionName, documentId).delete;

export function createDoc(
  collectionName: string,
  documentId: string,
  data: DocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return makeDocRef(collectionName, documentId).create(data);
}

export const updateDoc =
  (documentId: string) =>
  (collectionName: string) =>
  (data: WriteDocumentData): T.Task<FirebaseFirestore.WriteResult> =>
  () =>
    makeDocRef(collectionName, documentId).update(data);

export const updateDoc__ =
  (collectionName: string, documentId: string) =>
  (data: WriteDocumentData): T.Task<FirebaseFirestore.WriteResult> =>
    updateDoc(documentId)(collectionName)(data);

export const toDocumentIds = flow(
  getSnapshotDocs,
  A.map(wrapFirebaseSnapshot),
  A.map((snapshot) => snapshot.id)
);

// export const getCollection = (
//   collectionName: string,
//   query: O.Option<Query>
// ): T.Task<readonly DocumentSnapshot[]> =>
//   pipe(
//     collectionName,
//     makeCollectionRef,
//     makeQueryFromCollectionRef(query),
//     getDocument,
//     T.map(flow(getSnapshotDocs, A.map(wrapFirebaseSnapshot)))
//   );

// export const _ = { getDocRef };
