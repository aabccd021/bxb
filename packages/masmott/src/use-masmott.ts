import { FirebaseOptions, initializeApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore/lite';
import { useEffect } from 'react';

function initMasmott(options: FirebaseOptions): void {
  const app = initializeApp(options);
  const firestore = getFirestore(app);
  connectFirestoreEmulator(firestore, 'localhost', 8080);
}

export function useMasmottWithOption(options: FirebaseOptions): void {
  useEffect(() => {
    initMasmott(options);
  }, [options]);
}
