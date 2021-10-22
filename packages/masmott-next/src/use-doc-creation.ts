import { setDoc } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'
import { CollectionSpec, Dict } from './core/types'
import { getDocRef } from './get-doc-ref'
import { getId } from './get-id'
import { DocCreation, DocCreationData, DocData, DocKey } from './types'
import { useMutateDoc } from './use-mutate-doc'
import { useUpdateCountViews } from './use-update-count-views'

export function useDocCreation<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
>(collection: string, spec: Dict<CollectionSpec>): DocCreation<DD, CDD> {
  const mutateDoc = useMutateDoc()

  const updateCountViews = useUpdateCountViews()

  const [state, setState] = useState<DocCreation>({
    state: 'initial'
  })

  const reset = useCallback(() => setState({ state: 'initial' }), [])

  const createDoc = useCallback(
    (data: DocCreationData) => {
      const id = getId(collection)

      setState({ state: 'creating', id, data })

      const docKey: DocKey = [collection, id]
      const docRef = getDocRef(docKey)
      setDoc(docRef, data)
        .then(() => {
          setState({
            state: 'created',
            reset,
            createdDoc: {
              id,
              data
            }
          })

          // update document cache
          mutateDoc(docKey, { exists: true, data })

          updateCountViews({
            updatedCollectionName: collection,
            spec,
            data,
            incrementValue: 1
          })
          // There is no logic to materialize view, because:
          // (1) A view should not be read before the source document is
          // created
          // (2) Aggregating or joining from limited document on cache does not
          // make sense
        })
        .catch(reason =>
          setState({
            state: 'error',
            reason,
            reset,
            retry: () => createDoc(data)
          })
        )
    },
    [collection, updateCountViews, reset, mutateDoc, spec]
  )

  useEffect(() => {
    if (state.state === 'initial') {
      setState({ state: 'notCreated', createDoc })
    }
  }, [createDoc, state])

  return state as DocCreation<DD, CDD>
}
