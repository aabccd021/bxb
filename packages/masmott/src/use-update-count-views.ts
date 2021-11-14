import { useCallback } from 'react';
import { makeViewDocMutations } from './pure/make-view-doc-mutation';
import { UpdateCountViews } from './types';
import { Schema } from './types/io';
import { useMutateDocWithKey } from './use-mutate-doc';

export function useUpdateCountViews(
  incrementValue: 1 | -1,
  schema: Schema,
  updatedCollectionName: string
): UpdateCountViews {
  const mutateDocWithKey = useMutateDocWithKey();

  const updateCountViews = useCallback<UpdateCountViews>(
    (data) => {
      const viewDocMutations = makeViewDocMutations(
        data,
        incrementValue,
        schema,
        updatedCollectionName
      );
      viewDocMutations.forEach(({ docKey, mutatorCallback, viewName }) =>
        mutateDocWithKey(docKey, mutatorCallback, { viewName })
      );
    },
    [incrementValue, schema, updatedCollectionName, mutateDocWithKey]
  );

  return updateCountViews;
}
