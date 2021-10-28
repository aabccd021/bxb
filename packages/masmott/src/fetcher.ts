import { DocSnapshot } from './types';

export async function fetcher(path: string): Promise<DocSnapshot> {
  const firestoreModule = await import('firebase/firestore/lite');
  const firestore = firestoreModule.getFirestore();
  const docRef = firestoreModule.doc(firestore, path);
  const snapshot = await firestoreModule.getDoc(docRef);
  const data = snapshot.data();
  if (data !== undefined) {
    return { exists: true, data };
  }
  return { exists: false };
}
