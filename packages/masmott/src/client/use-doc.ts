/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { makeFetcher } from './firebase';
import { Doc, DocKey, FirebaseOptions } from './types';
import { makeDocPath } from './util';

export function useDoc(
  firebaseOptions: FirebaseOptions,
  [collectionName, id]: DocKey,
  options?: {
    readonly revalidateOnMount?: boolean;
    readonly view?: string | undefined;
  }
): Doc.Type {
  const [doc, setDoc] = useState<Doc.Type>({ state: 'fetching' });

  const docPath = useMemo(
    () => makeDocPath(collectionName, id, options?.view),
    [collectionName, options?.view, id]
  );

  const fetcher = useMemo(() => makeFetcher(firebaseOptions), [firebaseOptions]);

  const {
    data: snapshot,
    error,
    mutate,
  } = useSWR(docPath, fetcher, {
    revalidateOnMount: options?.revalidateOnMount ?? true,
  });

  useEffect(() => {
    if (snapshot === undefined) {
      return;
    }

    if (error) {
      setDoc({ reason: error, revalidate: mutate, state: 'error' });
      return;
    }

    if (snapshot.exists) {
      setDoc({
        data: snapshot.data,
        exists: true,
        revalidate: mutate,
        state: 'loaded',
      });
      return;
    }

    setDoc({
      exists: false,
      revalidate: mutate,
      state: 'loaded',
    });
  }, [snapshot, error, mutate]);

  return doc;
}
