// eslint-disable-next-line no-restricted-imports
import { firestore } from 'firebase-admin';
import { DocumentData } from './type';

/**
 * Firebase wrapper with type safe Document Data
 */

export function getDoc(
  collectionName: string,
  documentId: string
): Promise<FirebaseFirestore.DocumentSnapshot<DocumentData>> {
  return firestore().collection(collectionName).doc(documentId).get();
}

export function deleteDoc(
  collectionName: string,
  documentId: string
): Promise<FirebaseFirestore.WriteResult> {
  return firestore().collection(collectionName).doc(documentId).delete();
}

export function createDoc(
  collectionName: string,
  documentId: string,
  data: DocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return firestore().collection(collectionName).doc(documentId).create(data);
}

export function updateDoc(
  collectionName: string,
  documentId: string,
  data: DocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return firestore().collection(collectionName).doc(documentId).update(data);
}

export function getCollection(
  collectionName: string,
  query?: (
    collectionRef: FirebaseFirestore.CollectionReference<DocumentData>
  ) => FirebaseFirestore.Query<DocumentData>
): Promise<FirebaseFirestore.QuerySnapshot<DocumentData>> {
  const collectionRef = firestore().collection(collectionName);
  const collectionQuery =
    query === undefined ? collectionRef : query(collectionRef);
  return collectionQuery.get();
}
