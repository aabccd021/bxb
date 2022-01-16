import { FirebaseError } from '@firebase/util';
import { getFirestore } from 'firebase-admin/firestore';

type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

export const _createDoc =
  (left: (a: string) => unknown) =>
  (right: (a: Timestamp) => unknown) =>
  (collection: string) =>
  (docId: string) =>
  (data: FirebaseFirestore.DocumentData): Promise<unknown> =>
    getFirestore()
      .collection(collection)
      .doc(docId)
      .create(data)
      .then((result) => right(result.writeTime))
      .catch((error) =>
        left(error instanceof FirebaseError ? error.code : 'Unknown error')
      );
