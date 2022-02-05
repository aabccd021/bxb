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

  describe('functions', () => {
    it('can materialize select view', async () => {
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

  describe('security rules', () => {
    it("can't write with invalid text field (not a string)", async () =>
      expect(async () =>
        addDoc(collection(firestore, 'post'), {
          text: 46,
          title: 'tiltee',
        })
      ).rejects.toThrow('Request failed with error: Forbidden'));

    it("can't write with invalid title field (not a string)", async () =>
      expect(async () =>
        addDoc(collection(firestore, 'post'), {
          text: 'textt',
          title: 21,
        })
      ).rejects.toThrow('Request failed with error: Forbidden'));

    it("can't write without text field", async () =>
      expect(async () =>
        addDoc(collection(firestore, 'post'), {
          title: 'tiltee',
        })
      ).rejects.toThrow('Request failed with error: Forbidden'));

    it("can't write without title field", async () =>
      expect(async () =>
        addDoc(collection(firestore, 'post'), {
          text: 'textt',
        })
      ).rejects.toThrow('Request failed with error: Forbidden'));

    it("can't write with unknown field", async () =>
      expect(async () =>
        addDoc(collection(firestore, 'post'), {
          kira: 'masumoto',
          text: 'textt',
          title: 'titlee',
        })
      ).rejects.toThrow('Request failed with error: Forbidden'));
  });
});
