import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from './fetcher';
import { Doc, DocKey } from './types';
import { makeDocPath } from './util';

export function useDoc<T extends Doc.Type>(
  [collectionName, id]: DocKey,
  options?: {
    readonly view?: string | undefined;
    readonly revalidateOnMount?: boolean;
  }
): T {
  const [doc, setDoc] = useState<Doc.Type>({ state: 'fetching' });

  const docPath = useMemo(
    () => makeDocPath(collectionName, id, options?.view),
    [collectionName, options?.view, id]
  );

  const {
    data: snapshot,
    error,
    mutate,
  } = useSWR(docPath, fetcher, { revalidateOnMount: options?.revalidateOnMount ?? true });

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
