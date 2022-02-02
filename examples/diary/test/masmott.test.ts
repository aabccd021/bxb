import { getApps, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore as _getFirestore,
} from 'firebase/firestore/lite';

const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms));

const getFirebase = () => {
  const [app] = getApps();
  return app !== undefined ? app : initializeApp({ projectId: 'demo-diary' });
};

const firestore = _getFirestore(getFirebase());

describe('Diary', () => {
  beforeAll(() => {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  });

  it('Select view', async () => {
    const { id } = await addDoc(collection(firestore, 'post'), {
      text: 'textt',
      title: 'tiltee',
    });

    await delay(2000);

    expect((await getDoc(doc(firestore, 'post_card', id))).data()).toStrictEqual({
      title: 'tiltee',
    });

    expect((await getDoc(doc(firestore, 'post_page', id))).data()).toStrictEqual({
      text: 'textt',
      title: 'tiltee',
    });
  });
});
