import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { MutateDocWithId, MutateDocWithKey } from './types';
import { makeDocPath } from './util';

export function useMutateDocWithId(collection: string): MutateDocWithId {
  const { mutate } = useSWRConfig();

  const mutateDoc = useCallback<MutateDocWithId>(
    async (id, data, options) => {
      const path = makeDocPath(collection, id, options?.viewName);
      const shouldRevalidate = options?.shouldRevalidate ?? false;
      await mutate(path, data, shouldRevalidate);
    },
    [collection, mutate]
  );
  return mutateDoc;
}

export function useMutateDocWithKey(): MutateDocWithKey {
  const { mutate } = useSWRConfig();

  const mutateDoc = useCallback<MutateDocWithKey>(
    async ([collection, id], data, options) => {
      const path = makeDocPath(collection, id, options?.viewName);
      const shouldRevalidate = options?.shouldRevalidate ?? false;
      await mutate(path, data, shouldRevalidate);
    },
    [mutate]
  );
  return mutateDoc;
}
