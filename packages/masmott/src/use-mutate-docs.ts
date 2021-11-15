import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { MutateDocs } from './types';
import { makeDocPath } from './util';

export function useMutateDocs(): MutateDocs {
  const { mutate } = useSWRConfig();

  const mutateDocs = useCallback<MutateDocs>(
    (actions) =>
      Promise.all(
        actions.map(({ key: [collection, id], data, options }) => {
          const path = makeDocPath(collection, id, options?.viewName);
          const shouldRevalidate = options?.shouldRevalidate ?? false;
          return mutate(path, data, shouldRevalidate);
        })
      ),
    [mutate]
  );
  return mutateDocs;
}
