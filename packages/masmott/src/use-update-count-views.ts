import { useCallback } from 'react';
import { makeViewDocMutations } from './pure/make-view-doc-mutation';
import { DocCreationData, IncrementSpecs, UpdateCountViews } from './types';
import { useMutateDocWithKey } from './use-mutate-doc';

export function useUpdateCountViews<DCD extends DocCreationData>(
  incrementValue: 1 | -1,
  incrementSpecs: IncrementSpecs<DCD>
): UpdateCountViews<DCD> {
  const mutateDocWithKey = useMutateDocWithKey();

  const updateCountViews = useCallback<UpdateCountViews<DCD>>(
    (data) => {
      const viewDocMutations = makeViewDocMutations<DCD>(data, incrementValue, incrementSpecs);
      viewDocMutations.forEach(({ docKey, mutatorCallback, viewName }) =>
        mutateDocWithKey(docKey, mutatorCallback, { viewName })
      );
    },
    [incrementValue, incrementSpecs, mutateDocWithKey]
  );

  return updateCountViews;
}
