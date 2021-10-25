import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { MutateUpdateView } from './types';

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
