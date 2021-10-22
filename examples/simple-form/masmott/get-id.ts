import { collection, doc, getFirestore } from "firebase/firestore/lite";

export function getId(collectionName: string): string {
  const firestore = getFirestore();
  const collectionRef = collection(firestore, collectionName);
  const docRef = doc(collectionRef);
  return docRef.id;
}
