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

import { CollectionSpec, Dictionary } from './type';

type MutateSetDoc = (
  key: DocKey,
  data?: Doc,
  shouldRevalidate?: boolean
) => Promise<void>;

type MutateUpdateView = (
  key: ViewKey,
  data?: Doc | ((doc: Doc) => Doc),
  shouldRevalidate?: boolean
) => Promise<void>;

export function useMutateDoc(): MutateSetDoc {
  const { mutate } = useSWRConfig();
  const mutateDoc = useCallback<MutateSetDoc>(
    ([collectionName, id], data, shouldRevalidate) => {
      const path = `${collectionName}/${id}`;
      return mutate(path, data, shouldRevalidate);
    },
    [mutate]
  );
  return mutateDoc;
}

export function useMutateView(): MutateUpdateView {
  const { mutate } = useSWRConfig();
  const mutateView = useCallback<MutateUpdateView>(
    ([collectionName, viewName, id], data, shouldRevalidate) => {
      const path = `${collectionName}_${viewName}/${id}`;
      return mutate(path, data, shouldRevalidate);
    },
    [mutate]
  );
  return mutateView;
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
      reset: () => void;
    }
  | {
      state: 'creating';
      id: string;
      data: DD;
    }
  | {
      state: 'created';
      id: string;
      data: DD;
      reset: () => void;
    };

type Field = string | number;

type DocKey = [string, string];

function firestoreFetcher(path: string): Promise<DocumentSnapshot<DocData>> {
  const firestore = getFirestore();
  const docRef = doc(firestore, path);
  return getDoc(docRef);
}

export type ViewKey = [string, string, string];

type UpdateView = (
  key: ViewKey,
  mutate: (data: DocData) => DocData,
  shouldRevalidate?: boolean
) => void;

function useUpdateView(): UpdateView {
  const mutateView = useMutateView();
  const updateView = useCallback<UpdateView>(
    (key, mutate) => {
      mutateView(key, (doc) => {
        if (doc?.state === 'loaded' && doc.exists) {
          const mutatedData = mutate(doc.data);
          return { ...doc, data: mutatedData };
        }
        return doc;
      });
    },

    [mutateView]
  );
  return updateView;
}

export function getId(): string {
  return 'a';
}

type UpdateCountViews = (data: DocData) => void;

function useUpdateCountViews(
  collectionName: string,
  spec: Dictionary<CollectionSpec>,
  incrementValue: 1 | -1
): UpdateCountViews {
  const updateView = useUpdateView();

  const updateCountViews = useCallback<UpdateCountViews>(
    (data) => {
      Object.entries(spec).forEach(([viewCollectionName, { views }]) =>
        Object.entries(views).forEach(([viewName, { countSpecs }]) =>
          countSpecs.forEach(
            ({
              countedCollectionName,
              fieldName: counterFieldName,
              groupBy: refIdFieldName,
            }) => {
              if (countedCollectionName !== collectionName) {
                return;
              }

              const viewId = data[refIdFieldName];
              if (typeof viewId !== 'string') {
                throw Error(JSON.stringify({ data, refIdFieldName }));
              }

              const viewKey: ViewKey = [viewCollectionName, viewName, viewId];

              // update count view if exists in cache
              updateView(viewKey, (viewData) => {
                const counterFieldValue = viewData[counterFieldName];
                if (typeof counterFieldValue !== 'number') {
                  throw Error(JSON.stringify({ counterFieldName, viewData }));
                }

                const updatedCounterFieldValue =
                  counterFieldValue + incrementValue;

                const updatedViewData = {
                  ...viewData,
                  [counterFieldName]: updatedCounterFieldValue,
                };
                return updatedViewData;
              });
            }
          )
        )
      );
    },
    [collectionName, spec, updateView, incrementValue]
  );

  return updateCountViews;
}

export function _useDocCreation(
  collectionName: string,
  spec: Dictionary<CollectionSpec>
): DocCreation {
  const [state, setState] = useState<DocCreation>({
    state: 'initial',
  });

  const reset = useCallback(() => setState({ state: 'initial' }), []);

  const mutateDoc = useMutateDoc();

  const updateDocCacheStateToLoaded = useCallback(
    (key: DocKey, data: DocData) => {
      mutateDoc(key, {
        state: 'loaded',
        exists: true,
        data,
        revalidate: () => mutateDoc(key),
      });
    },
    [mutateDoc]
  );

  const updateCountViews = useUpdateCountViews(collectionName, spec, 1);

  const createDoc = useCallback(
    (data: DocCreationData) => {
      const id = getId();

      setState({ state: 'creating', id, data });

      const docKey: DocKey = [collectionName, id];
      const docRef = getDocRef(docKey);
      firestoreSetDoc(docRef, data)
        .then(() => {
          setState({ state: 'created', id, data, reset });
          updateDocCacheStateToLoaded(docKey, data);
          updateCountViews(data);
          // There is no logic to materialize view, because:
          // (1) A view should not be read before the source document is
          // created
          // (2) Aggregating or joining from limited document on cache does not
          // make sense
        })
        .catch((reason) =>
          setState({
            state: 'error',
            reason,
            reset,
            retry: () => createDoc(data),
          })
        );
    },
    [collectionName, updateCountViews, reset, updateDocCacheStateToLoaded]
  );

  useEffect(() => {
    if (state.state === 'initial') {
      setState({ state: 'notCreated', createDoc });
    }
  }, [createDoc, state]);

  return state;
}

export function _useDoc(key: DocKey): Doc {
  const [doc, setDoc] = useState<Doc>({ state: 'fetching' });
  const { data, error, mutate } = useSWR(key, firestoreFetcher);

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
