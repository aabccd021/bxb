import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

import { Doc, DocData, DocKey, ViewKey } from './types';

type MutateUpdateView = (
  key: ViewKey,
  data?: Doc | ((doc: Doc) => Doc),
  shouldRevalidate?: boolean
) => Promise<void>;

function useMutateView(): MutateUpdateView {
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

export type UpdateView = (
  key: ViewKey,
  mutate: (data: DocData) => DocData
) => void;

export function useUpdateView(): UpdateView {
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

export type DeleteView = (key: ViewKey) => void;

export function useDeleteView(): DeleteView {
  const mutateView = useMutateView();
  const deleteView = useCallback<DeleteView>(
    (key) => {
      mutateView(key, {
        state: 'loaded',
        exists: false,
        revalidate: () => mutateView(key),
      });
    },
    [mutateView]
  );
  return deleteView;
}

export type MutateSetDoc = (
  key: DocKey,
  data?: Doc,
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
