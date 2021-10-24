import { Spec } from "masmott-functions";
import { useCallback } from "react";
import { getNumberField, getStringField } from "./type-util";
import { DocData, UpdateCountViews, ViewKey, ViewUpdate } from "./types";
import { useUpdateView } from "./use-update-view";

type UpdateCountView = (p: {
  readonly countedCollectionName: string;
  readonly data: DocData;
  readonly refIdFieldName: string;
  readonly viewCollectionName: string;
  readonly viewName: string;
  readonly counterFieldName: string;
}) => void;

function incrementField(fieldName: string, incrementValue: 1 | -1): ViewUpdate {
  return (viewData) => {
    const counterFieldValue = getNumberField(viewData, fieldName);
    const updatedCounterFieldValue = counterFieldValue + incrementValue;
    const updatedViewData = {
      ...viewData,
      [fieldName]: updatedCounterFieldValue,
    };
    return updatedViewData;
  };
}

export function useUpdateCountViews(
  updatedCollectionName: string,
  spec: Spec,
  incrementValue: 1 | -1
): UpdateCountViews {
  const updateView = useUpdateView();

  const updateCountView = useCallback<UpdateCountView>(
    ({
      countedCollectionName,
      data,
      refIdFieldName,
      viewCollectionName,
      viewName,
      counterFieldName,
    }) => {
      if (countedCollectionName !== updatedCollectionName) {
        return;
      }

      const viewId = getStringField(data, refIdFieldName);
      const viewKey: ViewKey = [viewCollectionName, viewName, viewId];

      // update count view if exists in cache
      updateView(viewKey, incrementField(counterFieldName, incrementValue));
    },
    [incrementValue, updateView, updatedCollectionName]
  );

  const updateCountViews = useCallback<UpdateCountViews>(
    (data) => {
      Object.entries(spec).forEach(([viewCollectionName, { views }]) =>
        Object.entries(views).forEach(([viewName, { countSpecs }]) =>
          Object.entries(countSpecs).forEach(
            ([
              counterFieldName,
              { countedCollectionName, groupBy: refIdFieldName },
            ]) =>
              updateCountView({
                data,
                viewCollectionName,
                viewName,
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
