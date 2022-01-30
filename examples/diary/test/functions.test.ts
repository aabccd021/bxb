import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  Firestore,
  getDoc,
  getFirestore,
} from 'firebase/firestore/lite';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe('Diary', () => {
  let app: FirebaseApp;
  let firestore: Firestore;

  beforeAll(() => {
    app = initializeApp({ projectId: 'demo-diary' });
    firestore = getFirestore(app);
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  });

  it('Select view', async () => {
    const { id } = await addDoc(collection(firestore, 'post'), {
      text: 'textt',
      title: 'tiltee',
    });

    await delay(2000);

    expect(
      (await getDoc(doc(firestore, 'post_card', id))).data()
    ).toStrictEqual({
      title: 'tiltee',
    });

    expect(
      (await getDoc(doc(firestore, 'post_page', id))).data()
    ).toStrictEqual({
      text: 'textt',
      title: 'tiltee',
    });
  });
});
