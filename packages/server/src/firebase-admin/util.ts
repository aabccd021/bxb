// eslint-disable-next-line no-restricted-imports
import * as firestore from 'firebase-admin/firestore';
import { DocumentSnapshot } from '../type';

export function wrapFirebaseSnapshot(
  snapshot: firestore.DocumentSnapshot
): DocumentSnapshot {
  return { id: snapshot.id, data: snapshot.data() ?? {} };
}
