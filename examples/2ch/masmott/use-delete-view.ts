import { useCallback } from 'react';
import { DeleteView } from './types';
import { useMutateView } from './use-mutate-view';

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
