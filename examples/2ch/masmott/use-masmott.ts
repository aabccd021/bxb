import { initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore/lite";
import { useEffect } from "react";

function initMasmott(): void {
  const app = initializeApp({ projectId: "demo-2ch" });
  const firestore = getFirestore(app);
  connectFirestoreEmulator(firestore, "localhost", 8080);
}

export function useMasmott(): void {
  useEffect(() => {
    initMasmott();
  }, []);
}
