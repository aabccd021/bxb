import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { MutateDocOfId, MutateDocOfKey } from './types';
import { makeDocPath } from './util';

export function useMutateDocWithId(collection: string): MutateDocOfId {
  const { mutate } = useSWRConfig();

  const mutateDoc = useCallback<MutateDocOfId>(
    async (id, data, options) => {
      const path = makeDocPath(collection, id, options?.view);
      const shouldRevalidate = options?.shouldRevalidate ?? false;
      await mutate(path, data, shouldRevalidate);
    },
    [collection, mutate]
  );
  return mutateDoc;
}

export function useMutateDocWithKey(): MutateDocOfKey {
  const { mutate } = useSWRConfig();

  const mutateDoc = useCallback<MutateDocOfKey>(
    async ([collection, id], data, options) => {
      const path = makeDocPath(collection, id, options?.view);
      const shouldRevalidate = options?.shouldRevalidate ?? false;
      await mutate(path, data, shouldRevalidate);
    },
    [mutate]
  );
  return mutateDoc;
}
