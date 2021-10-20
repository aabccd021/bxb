// eslint-disable-next-line no-restricted-imports
import { DocumentReference, getFirestore } from 'firebase-admin/firestore';
import { App } from '../type';

export function getDocRef(
  app: App,
  collectionName: string,
  documentId: string
): DocumentReference {
  return getFirestore(app).collection(collectionName).doc(documentId);
}
