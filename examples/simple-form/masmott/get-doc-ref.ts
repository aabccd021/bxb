import {
  collection,
  doc,
  DocumentReference,
  getFirestore,
} from "firebase/firestore/lite";
import { DocKey } from "./types";

export function getDocRef([collectionName, id]: DocKey): DocumentReference {
  const firestore = getFirestore();
  const collectionRef = collection(firestore, collectionName);
  const docRef = doc(collectionRef, id);
  return docRef;
}
