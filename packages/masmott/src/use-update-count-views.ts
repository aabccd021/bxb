import { useCallback } from 'react';
import { getNumberField, getStringField } from './type-util';
import {
  DocData,
  DocKey,
  DocSnapshot,
  DocSnapshotMutatorCallback,
  Spec,
  UpdateCountView,
  UpdateCountViews,
} from './types';
import { useMutateDocWithKey } from './use-mutate-doc';

function incrementField(fieldName: string, incrementValue: 1 | -1): DocSnapshotMutatorCallback {
  return (viewDoc): DocSnapshot => {
    if (!viewDoc.exists) {
      return viewDoc;
    }
    const counterFieldValue = getNumberField(viewDoc.data, fieldName);
    const updatedCounterFieldValue = counterFieldValue + incrementValue;
    const updatedViewData: DocData = {
      ...viewDoc.data,
      [fieldName]: updatedCounterFieldValue,
    };
    const updatedViewDoc: DocSnapshot = {
      ...viewDoc,
      data: updatedViewData,
    };
    return updatedViewDoc;
  };
}

export function useUpdateCountViews(
  updatedCollectionName: string,
  spec: Spec,
  incrementValue: 1 | -1
): UpdateCountViews {
  const mutateDocWithKey = useMutateDocWithKey();

  const updateCountView = useCallback<UpdateCountView>(
    ({
      countedCollectionName,
      data,
      refIdFieldName,
      viewCollectionName,
      view,
      counterFieldName,
    }) => {
      if (countedCollectionName !== updatedCollectionName) {
        return;
      }

      const viewId = getStringField(data, refIdFieldName);
      const docKey: DocKey = [viewCollectionName, viewId];

      const mutatorCallback = incrementField(counterFieldName, incrementValue);

      // update count view if exists in cache
      mutateDocWithKey(docKey, mutatorCallback, { view });
    },
    [incrementValue, mutateDocWithKey, updatedCollectionName]
  );

  const updateCountViews = useCallback<UpdateCountViews>(
    (data) => {
      Object.entries(spec).forEach(([viewCollectionName, { views }]) =>
        Object.entries(views).forEach(([view, { countSpecs }]) =>
          Object.entries(countSpecs).forEach(
            ([counterFieldName, { countedCollectionName, groupBy: refIdFieldName }]) =>
              updateCountView({
                data,
                viewCollectionName,
                view,
                counterFieldName,
                countedCollectionName,
                refIdFieldName,
              })
          )
        )
      );
    },
    [spec, updateCountView]
  );

  return updateCountViews;
}
