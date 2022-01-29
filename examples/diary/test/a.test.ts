import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  Firestore,
  getDoc,
  getFirestore,
  setDoc,
} from 'firebase/firestore/lite';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe('Fields', () => {
  let app: FirebaseApp;
  let firestore: Firestore;

  beforeAll(() => {
    app = initializeApp({ projectId: 'demo-diary' });
    firestore = getFirestore(app);
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  });

  it('has type property', async () => {
    const docRef = doc(collection(firestore, 'coll'), 'idd');
    await setDoc(docRef, { a: 'b' });
    expect((await getDoc(docRef)).data()).toStrictEqual({ a: 'b' });
  });

  it('test1', async () => {
    const docRef = await addDoc(collection(firestore, 'post'), {
      text: 'textt',
      title: 'tiltee',
    });

    await delay(2000);

    expect(
      (await getDoc(doc(firestore, 'post_card', docRef.id))).data()
    ).toStrictEqual({
      title: 'tiltee',
    });

    expect(
      (await getDoc(doc(firestore, 'post_page', docRef.id))).data()
    ).toStrictEqual({
      text: 'textt',
      title: 'tiltee',
    });
  });
});
