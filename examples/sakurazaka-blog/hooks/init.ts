import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore/lite';
import { useEffect } from 'react';

function init(): void {
  const app = initializeApp({ projectId: 'demo-sakurazaka-blog' });
  const firestore = getFirestore(app);
  connectFirestoreEmulator(firestore, 'localhost', 8080);
}

export function useMasmott(): void {
  useEffect(() => {
    init();
  }, []);
}
