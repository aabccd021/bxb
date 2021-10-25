import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { MutateSetDoc } from './types';
import { makeDocPath } from './util';

export function useMutateDoc(): MutateSetDoc {
  const { mutate } = useSWRConfig();
  const mutateDoc = useCallback<MutateSetDoc>(
    async (docKey, data, options) => {
      const [collection, id] = docKey;
      const path = makeDocPath(collection, id, options?.viewName);
      await mutate(path, data);
    },
    [mutate]
  );
  return mutateDoc;
}
