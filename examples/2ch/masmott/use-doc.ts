import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from './fetcher';
import { Doc, DocKey } from './types';
import { makeDocPath } from './util';

export function useDoc<T extends Doc.Type>([collectionName, id]: DocKey, view?: string): T {
  const [doc, setDoc] = useState<Doc.Type>({ state: 'fetching' });

  const docPath = useMemo(() => makeDocPath(collectionName, id, view), [collectionName, view, id]);

  const { data: snapshot, error, mutate } = useSWR(docPath, fetcher);

  useEffect(() => {
    if (snapshot === undefined) {
      return;
    }

    if (error) {
      setDoc({ state: 'error', reason: error, revalidate: mutate });
      return;
    }

    if (snapshot.exists) {
      setDoc({
        state: 'loaded',
        exists: true,
        data: snapshot.data,
        revalidate: mutate,
      });
      return;
    }

    setDoc({
      state: 'loaded',
      exists: false,
      revalidate: mutate,
    });
  }, [snapshot, error, mutate]);

  return doc as T;
}
