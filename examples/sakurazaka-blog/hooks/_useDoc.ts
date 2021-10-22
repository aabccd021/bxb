import {
  collection,
  doc,
  DocumentReference,
  DocumentSnapshot,
  getDoc,
  getFirestore,
  setDoc as firestoreSetDoc,
} from 'firebase/firestore/lite';
import { Dictionary } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import { useMutateDoc, useUpdateView } from './mutate';
import { CollectionSpec } from './type';
import { Doc, DocCreation, DocCreationData, DocData, DocKey, ViewKey } from './types';

function firestoreFetcher(path: string): Promise<DocumentSnapshot<DocData>> {
  const firestore = getFirestore();
  const docRef = doc(firestore, path);
  return getDoc(docRef);
}

export function getId(): string {
  return 'a';
}

type UpdateCountViews = (p: {
  updatedCollectionName: string;
  spec: Dictionary<CollectionSpec>;
  incrementValue: 1 | -1;
  data: DocData;
}) => void;

function useUpdateCountViews(): UpdateCountViews {
  const updateView = useUpdateView();

  const updateCountViews = useCallback<UpdateCountViews>(
    ({ updatedCollectionName, spec, incrementValue, data }) => {
      Object.entries(spec).forEach(([viewCollectionName, { views }]) =>
        Object.entries(views).forEach(([viewName, { countSpecs }]) =>
          countSpecs.forEach(
            ({ countedCollectionName, fieldName: counterFieldName, groupBy: refIdFieldName }) => {
              if (countedCollectionName !== updatedCollectionName) {
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

                const updatedCounterFieldValue = counterFieldValue + incrementValue;

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
    [updateView]
  );

  return updateCountViews;
}

export function _useDocCreation(
  collectionName: string,
  spec: Dictionary<CollectionSpec>
): DocCreation {
  const mutateDoc = useMutateDoc();

  const updateCountViews = useUpdateCountViews();

  const [state, setState] = useState<DocCreation>({
    state: 'initial',
  });

  const reset = useCallback(() => setState({ state: 'initial' }), []);

  const createDoc = useCallback(
    (data: DocCreationData) => {
      const id = getId();

      setState({ state: 'creating', id, data });

      const docKey: DocKey = [collectionName, id];
      const docRef = getDocRef(docKey);
      firestoreSetDoc(docRef, data)
        .then(() => {
          setState({ state: 'created', id, data, reset });

          // update document cache
          mutateDoc(docKey, {
            state: 'loaded',
            exists: true,
            data,
            revalidate: () => mutateDoc(docKey),
          });

          updateCountViews({
            updatedCollectionName: collectionName,
            spec,
            data,
            incrementValue: 1,
          });
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
    [collectionName, updateCountViews, reset, mutateDoc, spec]
  );

  useEffect(() => {
    if (state.state === 'initial') {
      setState({ state: 'notCreated', createDoc });
    }
  }, [createDoc, state]);

  return state;
}

export function _useViewable([collectionName, id]: DocKey, viewName: string | undefined): Doc {
  const [doc, setDoc] = useState<Doc>({ state: 'fetching' });
  const viewSuffix = viewName !== undefined ? `_${viewName}` : '';
  const { data, error, mutate } = useSWR(`${collectionName}${viewSuffix}/${id}`, firestoreFetcher);

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
