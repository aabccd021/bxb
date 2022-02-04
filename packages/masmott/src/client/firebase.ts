/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { DocSnapshot, Fetcher, FirebaseOptions, GetId, InitMasmott, SetDoc } from './types';

const initMasmott: InitMasmott = async (options) => {
  const _ = await import('firebase/app');
  if (_.getApps().length === 0) {
    _.initializeApp(options);
    const isDev = window.location.hostname === 'localhost';
    if (isDev) {
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
  return await _.setDoc(docRef, data)
    .then(() => undefined)
    .catch((e: Error) => e);
};

export const getId: GetId = async (options, collection) => {
  await initMasmott(options);
  const _module = await import('firebase/firestore/lite');
  const firestore = _module.getFirestore();
  const collectionRef = _module.collection(firestore, collection);
  const docRef = _module.doc(collectionRef);
  return docRef.id;
};

export const makeFetcher = (options: FirebaseOptions): Fetcher => {
  return async (path): Promise<DocSnapshot> => {
    await initMasmott(options);
    const _ = await import('firebase/firestore/lite');
    const firestore = _.getFirestore();
    const docRef = _.doc(firestore, path);
    const snapshot = await _.getDoc(docRef);
    const data = snapshot.data();
    return data !== undefined ? { data, exists: true } : { exists: false };
  };
};
