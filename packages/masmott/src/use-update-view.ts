import { useCallback } from 'react'
import { UpdateView } from './types'
import { useMutateView } from './use-mutate-view'

export function useUpdateView(): UpdateView {
  const mutateView = useMutateView()
  const updateView = useCallback<UpdateView>(
    (key, mutate) => {
      mutateView(key, (doc) => {
        if (doc?.state === 'loaded' && doc.exists) {
          const mutatedData = mutate(doc.data)
          return { ...doc, data: mutatedData }
        }
        return doc
      })
    },
    [mutateView]
  )
  return updateView
}
