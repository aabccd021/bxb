import { Spec } from 'masmott-functions';
import { useCallback } from 'react';
import {
  DocKey,
  DocSnapshot,
  DocSnapshotMutatorCallback,
  getOptionalNumberField,
  useDocSWRConfig,
} from '.';
import { getStringField } from './type-util';
import { DocData, UpdateCountViews } from './types';

type UpdateCountView = (p: {
  readonly countedCollectionName: string;
  readonly data: DocData;
  readonly refIdFieldName: string;
  readonly viewCollectionName: string;
  readonly view: string;
  readonly counterFieldName: string;
}) => void;

function incrementField(fieldName: string, incrementValue: 1 | -1): DocSnapshotMutatorCallback {
  return (viewDoc) => {
    if (!viewDoc.exists) {
      console.log('notexists');
      return viewDoc;
    }
    const counterFieldValue = getOptionalNumberField(viewDoc.data, fieldName);
    const updatedCounterFieldValue = (counterFieldValue ?? 0) + incrementValue;
    const updatedViewData = {
      ...viewDoc.data,
      [fieldName]: updatedCounterFieldValue,
    };
    const updatedViewDoc: DocSnapshot = {
      ...viewDoc,
      data: updatedViewData,
    };
    console.log('exists', { updatedViewDoc });
    return updatedViewDoc;
  };
}

export function useUpdateCountViews(
  updatedCollectionName: string,
  spec: Spec,
  incrementValue: 1 | -1
): UpdateCountViews {
  const { mutateDoc } = useDocSWRConfig();

  const updateCountView = useCallback<UpdateCountView>(
    ({
      countedCollectionName,
      data,
      refIdFieldName,
      viewCollectionName,
      view,
      counterFieldName,
    }) => {
      console.log({
        data,
        viewCollectionName,
        view,
        counterFieldName,
        countedCollectionName,
        refIdFieldName,
        updatedCollectionName,
      });
      if (countedCollectionName !== updatedCollectionName) {
        return;
      }
      console.log('pass');

      const viewId = getStringField(data, refIdFieldName);
      const docKey: DocKey = [viewCollectionName, viewId];

      const mutatorCallback = incrementField(counterFieldName, incrementValue);

      // update count view if exists in cache
      mutateDoc(docKey, mutatorCallback, { view });
      console.log('pass2');
    },
    [incrementValue, mutateDoc, updatedCollectionName]
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
