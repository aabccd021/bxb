/* eslint-disable no-restricted-imports */
import { DocumentReference, FieldValue, getFirestore, GrpcStatus } from 'firebase-admin/firestore';
import { DocumentData, DocumentSnapshot, QuerySnapshot } from '../src';
import { WriteDocumentData } from './types';
import { wrapFirebaseSnapshot } from './util';

export const firestore = { FieldValue, GrpcStatus };

/**
 * Type safe and convenience firebase-admin wrapper
 */

function getDocRef(collectionName: string, documentId: string): DocumentReference {
  return getFirestore().collection(collectionName).doc(documentId);
}

export async function getDoc(
  collectionName: string,
  documentId: string
): Promise<DocumentSnapshot> {
  const snapshot = await _.getDocRef(collectionName, documentId).get();
  const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
  return wrappedSnapshot;
}

export function deleteDoc(
  collectionName: string,
  documentId: string
): Promise<FirebaseFirestore.WriteResult> {
  return _.getDocRef(collectionName, documentId).delete();
}

export function createDoc(
  collectionName: string,
  documentId: string,
  data: DocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return _.getDocRef(collectionName, documentId).create(data);
}

export function updateDoc(
  collectionName: string,
  documentId: string,
  data: WriteDocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return _.getDocRef(collectionName, documentId).update(data);
}

export async function getCollection(
  collectionName: string,
  query?: (
    collectionRef: FirebaseFirestore.CollectionReference<DocumentData>
  ) => FirebaseFirestore.Query<DocumentData>
): Promise<QuerySnapshot> {
  const collectionRef = getFirestore().collection(collectionName);
  const collectionQuery = query === undefined ? collectionRef : query(collectionRef);
  const snapshot = await collectionQuery.get();
  const wrappedDocs = snapshot.docs.map(wrapFirebaseSnapshot);
  const wrappedQuerySnapshot = {
    docs: wrappedDocs,
  };
  return wrappedQuerySnapshot;
}

export const _ = { getDocRef };
