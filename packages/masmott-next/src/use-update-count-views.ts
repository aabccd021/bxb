import { useCallback } from 'react'
import { UpdateCountViews, ViewKey } from './types'
import { useUpdateView } from './use-update-view'

export function useUpdateCountViews(): UpdateCountViews {
  const updateView = useUpdateView()

  const updateCountViews = useCallback<UpdateCountViews>(
    ({ updatedCollectionName, spec, incrementValue, data }) => {
      Object.entries(spec).forEach(([viewCollectionName, { views }]) =>
        Object.entries(views).forEach(([viewName, { countSpecs }]) =>
          Object.entries(countSpecs).forEach(
            ([
              counterFieldName,
              { countedCollectionName, groupBy: refIdFieldName }
            ]) => {
              if (countedCollectionName !== updatedCollectionName) {
                return
              }

              const viewId = data[refIdFieldName]
              if (typeof viewId !== 'string') {
                throw Error(JSON.stringify({ data, refIdFieldName }))
              }

              const viewKey: ViewKey = [viewCollectionName, viewName, viewId]

              // update count view if exists in cache
              updateView(viewKey, viewData => {
                const counterFieldValue = viewData[counterFieldName]
                if (typeof counterFieldValue !== 'number') {
                  throw Error(JSON.stringify({ counterFieldName, viewData }))
                }

                const updatedCounterFieldValue =
                  counterFieldValue + incrementValue

                const updatedViewData = {
                  ...viewData,
                  [counterFieldName]: updatedCounterFieldValue
                }
                return updatedViewData
              })
            }
          )
        )
      )
    },
    [updateView]
  )

  return updateCountViews
}
