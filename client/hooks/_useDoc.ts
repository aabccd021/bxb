import {
  collection,
  doc,
  DocumentReference,
  DocumentSnapshot,
  getDoc,
  getFirestore,
  setDoc as firestoreSetDoc,
} from 'firebase/firestore/lite';
import { useCallback, useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

type MutateDoc = (key: DocKey, data?: Doc) => Promise<void>;

export function useMutateDoc(): MutateDoc {
  const { mutate } = useSWRConfig();
  return mutate;
}

export type DocCreationData = {
  [key: string]: Field;
};

export type DocData = {
  [key: string]: Field;
};

export type Doc<DD extends DocData = DocData> =
  | { state: 'fetching' }
  | {
      state: 'error';
      reason: unknown;
      revalidate: () => void;
    }
  | {
      state: 'loaded';
      exists: true;
      data: DD;
      revalidate: () => void;
    }
  | {
      state: 'loaded';
      exists: false;
      revalidate: () => void;
    };

export type DocCreation<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
> =
  | { state: 'initial' }
  | {
      state: 'notCreated';
      createDoc: (data: CDD) => void;
    }
  | {
      state: 'error';
      reason: unknown;
      retry: () => void;
    }
  | {
      state: 'created' | 'creating';
      id: string;
      data: DD;
    };

type Field = string;

type DocKey = [string, string];

function fetcher(
  collectionName: string,
  id: string
): Promise<DocumentSnapshot<DocData>> {
  const firestore = getFirestore();
  const collectionRef = collection(firestore, collectionName);
  const docRef = doc(collectionRef, id);
  return getDoc(docRef);
}

export type CreateDoc = (data: DocCreationData) => void;

export function getId(): string {
  return 'a';
}

export function _useDocCreation(collectionName: string): DocCreation {
  const [docCreation, setDocCreation] = useState<DocCreation>({
    state: 'initial',
  });

  const setDoc = useSetDoc();

  const createDoc: CreateDoc = useCallback(
    (data) => {
      const id = getId();
      setDocCreation({ state: 'creating', id, data });
      setDoc([collectionName, id], data)
        .then(() => setDocCreation({ state: 'created', id, data }))
        .catch((reason) =>
          setDocCreation({
            state: 'error',
            reason,
            retry: () => createDoc(data),
          })
        );
    },
    [collectionName, setDoc]
  );

  useEffect(() => {
    if (docCreation.state === 'initial') {
      setDocCreation({ state: 'notCreated', createDoc });
    }
  }, [collectionName, docCreation, setDoc, createDoc]);

  return docCreation;
}

export function _useDoc(key: DocKey): Doc {
  const [doc, setDoc] = useState<Doc>({ state: 'fetching' });
  const { data, error, mutate } = useSWR(key, fetcher);

  useEffect(() => {
    if (data === undefined) {
      return;
    }

    if (error) {
      setDoc({ state: 'error', reason: error, revalidate: mutate });
      return;
    }

    if (data.exists()) {
      setDoc({
        state: 'loaded',
        exists: true,
        data: data.data(),
        revalidate: mutate,
      });
      return;
    }

    setDoc({
      state: 'loaded',
      exists: false,
      revalidate: mutate,
    });
  }, [data, error, mutate]);

  return doc;
}

export function getDocRef([collectionName, id]: DocKey): DocumentReference {
  const firestore = getFirestore();
  const collectionRef = collection(firestore, collectionName);
  const docRef = doc(collectionRef, id);
  return docRef;
}

type SetDoc = (key: DocKey, data: DocCreationData) => Promise<void>;

export function useSetDoc(): SetDoc {
  const mutateDoc = useMutateDoc();
  const setDoc: SetDoc = useCallback(
    async (key, data) => {
      mutateDoc(key, {
        state: 'loaded',
        exists: true,
        data,
        revalidate: () => mutateDoc(key),
      });
      const docRef = getDocRef(key);
      await firestoreSetDoc(docRef, data);
    },
    [mutateDoc]
  );
  return setDoc;
}

// export async function _createDoc(
//   collectionName: string,
//   data: CreateDocData
// ): Promise<string> {
//   const firestore = getFirestore();
//   const collectionRef = collection(firestore, collectionName);
//   const doc = await addDoc(collectionRef, data);
//   return doc.id;
// }
