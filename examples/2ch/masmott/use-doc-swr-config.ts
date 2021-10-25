import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { DocSWRConfig } from '.';
import { MutateDoc } from './types';
import { makeDocPath } from './util';

export function useDocSWRConfig(): DocSWRConfig {
  const { mutate, cache } = useSWRConfig();
  const mutateDoc = useCallback<MutateDoc>(
    async (docKey, data, options) => {
      const [collection, id] = docKey;
      const path = makeDocPath(collection, id, options?.view);
      await mutate(path, data);
    },
    [mutate]
  );
  return { mutateDoc, docCache: cache };
}
