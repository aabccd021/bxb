import { DocSnapshot, Fetcher, FirebaseOptions, GetId, InitMasmott, SetDoc } from './types';

const initMasmott: InitMasmott = async (options) => {
  const _ = await import('firebase/app');
  if (_.getApps().length === 0) {
    _.initializeApp(options);
    if (window.location.hostname === 'localhost') {
      const _firestore = await import('firebase/firestore/lite');
      const firestore = _firestore.getFirestore();
      _firestore.connectFirestoreEmulator(firestore, 'localhost', 8080);
    }
  }
};

export const setDoc: SetDoc = async (options, collection, id, data) => {
  await initMasmott(options);
  const _ = await import('firebase/firestore/lite');
  const firestore = _.getFirestore();
  const collectionRef = _.collection(firestore, collection);
  const docRef = _.doc(collectionRef, id);
  await _.setDoc(docRef, data);
};

export const getId: GetId = async (options, collection) => {
  await initMasmott(options);
  const _module = await import('firebase/firestore/lite');
  const firestore = _module.getFirestore();
  const collectionRef = _module.collection(firestore, collection);
  const docRef = _module.doc(collectionRef);
  return docRef.id;
};

export function makeFetcher(options: FirebaseOptions): Fetcher {
  return async (path): Promise<DocSnapshot> => {
    await initMasmott(options);
    const _ = await import('firebase/firestore/lite');
    const firestore = _.getFirestore();
    const docRef = _.doc(firestore, path);
    const snapshot = await _.getDoc(docRef);
    const data = snapshot.data();
    if (data !== undefined) {
      return { exists: true, data };
    }
    return { exists: false };
  };
}
