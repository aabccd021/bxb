import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import { DocSnapshot } from "./types";

export async function fetcher(path: string): Promise<DocSnapshot> {
  const firestore = getFirestore();
  const docRef = doc(firestore, path);
  const snapshot = await getDoc(docRef);
  const data = snapshot.data();
  if (data !== undefined) {
    return { exists: true, data };
  }
  return { exists: false };
}
