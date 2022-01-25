import { FirebaseApp, initializeApp } from 'firebase/app';
import {
	collection,
	connectFirestoreEmulator,
	doc,
	Firestore,
	getDoc,
	getFirestore,
	setDoc
} from 'firebase/firestore/lite';

describe('Fields', () => {
  let app: FirebaseApp;
  let firestore: Firestore;

  beforeAll(() => {
    app = initializeApp({ projectId: 'demo-diary' });
    firestore = getFirestore(app);
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  });

  it('has type property', async () => {
    const coll = collection(firestore, 'coll');
    const docRef = doc(coll, 'idd');
    await setDoc(docRef, { a: 'b' });
    const res = await getDoc(docRef);
    expect(res.data()).toStrictEqual({ a: 'b' });
  });
});
