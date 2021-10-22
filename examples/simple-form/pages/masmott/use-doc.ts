import {
  doc,
  DocumentSnapshot,
  getDoc,
  getFirestore,
} from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Doc, DocData, DocKey } from "./types";

function firestoreFetcher(path: string): Promise<DocumentSnapshot<DocData>> {
  const firestore = getFirestore();
  const docRef = doc(firestore, path);
  return getDoc(docRef);
}

export function useDoc<T extends Doc>(
  [collectionName, id]: DocKey,
  viewName: string | undefined
): T {
  const [doc, setDoc] = useState<Doc>({ state: "fetching" });
  const viewSuffix = viewName !== undefined ? `_${viewName}` : "";
  const { data, error, mutate } = useSWR(
    `${collectionName}${viewSuffix}/${id}`,
    firestoreFetcher
  );

  useEffect(() => {
    if (data === undefined) {
      return;
    }

    if (error) {
      setDoc({ state: "error", reason: error, revalidate: mutate });
      return;
    }

    if (data.exists()) {
      setDoc({
        state: "loaded",
        exists: true,
        data: data.data(),
        revalidate: mutate,
      });
      return;
    }

    setDoc({
      state: "loaded",
      exists: false,
      revalidate: mutate,
    });
  }, [data, error, mutate]);

  return doc as T;
}
