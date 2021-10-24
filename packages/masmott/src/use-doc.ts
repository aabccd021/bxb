import {
  doc as makeDocRef,
  getDoc,
  getFirestore,
} from 'firebase/firestore/lite'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Doc, DocKey, DocSnapshot } from './types'

async function firestoreFetcher(path: string): Promise<DocSnapshot> {
  const firestore = getFirestore()
  const docRef = makeDocRef(firestore, path)
  const snapshot = await getDoc(docRef)
  if (snapshot.exists()) {
    return {
      exists: true,
      data: snapshot.data(),
    }
  }
  return {
    exists: false,
  }
}

export function useDoc<T extends Doc>(
  [collectionName, id]: DocKey,
  viewName: string | undefined
): T {
  const [doc, setDoc] = useState<Doc>({ state: 'fetching' })
  const viewSuffix = viewName !== undefined ? `_${viewName}` : ''
  const {
    data: snapshot,
    error,
    mutate,
  } = useSWR(`${collectionName}${viewSuffix}/${id}`, firestoreFetcher)

  useEffect(() => {
    if (snapshot === undefined) {
      return
    }

    if (error) {
      setDoc({ state: 'error', reason: error, revalidate: mutate })
      return
    }

    if (snapshot.exists) {
      setDoc({
        state: 'loaded',
        exists: true,
        data: snapshot.data,
        revalidate: mutate,
      })
      return
    }

    setDoc({
      state: 'loaded',
      exists: false,
      revalidate: mutate,
    })
  }, [snapshot, error, mutate])

  return doc as T
}
