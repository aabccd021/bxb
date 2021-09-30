// eslint-disable-next-line no-restricted-imports
import { firestore } from 'firebase-admin';
import { DocumentData, DocumentSnapshot, QuerySnapshot } from '../type';

/**
 * Type safe and convenience firebase-admin wrapper
 */

export function wrapFirebaseSnapshot(
  snapshot: firestore.DocumentSnapshot
): DocumentSnapshot {
  const data = snapshot.data();
  if (data === undefined) {
    throw Error(`Invalid Type ${JSON.stringify(snapshot)}`);
  }
  return {
    id: snapshot.id,
    data,
  };
}

export async function getDoc(
  collectionName: string,
  documentId: string
): Promise<DocumentSnapshot> {
  const snapshot = await firestore()
    .collection(collectionName)
    .doc(documentId)
    .get();
  const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
  return wrappedSnapshot;
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

export async function getCollection(
  collectionName: string,
  query?: (
    collectionRef: FirebaseFirestore.CollectionReference<DocumentData>
  ) => FirebaseFirestore.Query<DocumentData>
): Promise<QuerySnapshot> {
  const collectionRef = firestore().collection(collectionName);
  const collectionQuery =
    query === undefined ? collectionRef : query(collectionRef);
  const snapshot = await collectionQuery.get();
  const wrappedDocs = snapshot.docs.map(wrapFirebaseSnapshot);
  const wrappedQuerySnapshot = {
    docs: wrappedDocs,
  };
  return wrappedQuerySnapshot;
}