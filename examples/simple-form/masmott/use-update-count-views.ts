import { useCallback } from "react";
import { CollectionSpec, Dict } from "./core/types";
import { getNumberField, getStringField } from "./type-util";
import { DocData, UpdateCountViews, ViewKey } from "./types";
import { useUpdateView } from "./use-update-view";

type UpdateCountView = (p: {
  readonly countedCollectionName: string;
  readonly data: DocData;
  readonly refIdFieldName: string;
  readonly viewCollectionName: string;
  readonly viewName: string;
  readonly counterFieldName: string;
}) => void;

export function useUpdateCountViews(
  updatedCollectionName: string,
  spec: Dict<CollectionSpec>,
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
      updateView(viewKey, (viewData) => {
        const counterFieldValue = getNumberField(viewData, counterFieldName);
        const updatedCounterFieldValue = counterFieldValue + incrementValue;
        const updatedViewData = {
          ...viewData,
          [counterFieldName]: updatedCounterFieldValue,
        };
        return updatedViewData;
      });
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
