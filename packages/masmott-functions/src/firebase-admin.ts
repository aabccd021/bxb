/* eslint-disable no-restricted-imports */
import { FieldValue, getFirestore, GrpcStatus } from 'firebase-admin/firestore';
import {
  App,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  WriteDocumentData,
} from './type';
import { wrapFirebaseSnapshot } from './util';

export const firestore = { FieldValue, GrpcStatus };

/**
 * Type safe and convenience firebase-admin wrapper
 */

function getDocRef(
  app: App,
  collectionName: string,
  documentId: string
): DocumentReference {
  app;
  return getFirestore().collection(collectionName).doc(documentId);
}

export async function getDoc(
  app: App,
  collectionName: string,
  documentId: string
): Promise<DocumentSnapshot> {
  const snapshot = await _.getDocRef(app, collectionName, documentId).get();
  const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
  return wrappedSnapshot;
}

export function deleteDoc(
  app: App,
  collectionName: string,
  documentId: string
): Promise<FirebaseFirestore.WriteResult> {
  return _.getDocRef(app, collectionName, documentId).delete();
}

export function createDoc(
  app: App,
  collectionName: string,
  documentId: string,
  data: DocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return _.getDocRef(app, collectionName, documentId).create(data);
}

export function updateDoc(
  app: App,
  collectionName: string,
  documentId: string,
  data: WriteDocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return _.getDocRef(app, collectionName, documentId).update(data);
}

export async function getCollection(
  app: App,
  collectionName: string,
  query?: (
    collectionRef: FirebaseFirestore.CollectionReference<DocumentData>
  ) => FirebaseFirestore.Query<DocumentData>
): Promise<QuerySnapshot> {
  const collectionRef = getFirestore(app).collection(collectionName);
  const collectionQuery =
    query === undefined ? collectionRef : query(collectionRef);
  const snapshot = await collectionQuery.get();
  const wrappedDocs = snapshot.docs.map(wrapFirebaseSnapshot);
  const wrappedQuerySnapshot = {
    docs: wrappedDocs,
  };
  return wrappedQuerySnapshot;
}

export const _ = { getDocRef };
