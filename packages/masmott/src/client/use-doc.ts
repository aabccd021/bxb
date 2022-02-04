/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { makeFetcher } from './firebase';
import { Doc, DocData, DocKey, FirebaseOptions } from './types';
import { makeDocPath } from './util';

export function useDoc<DD extends DocData>(
  firebaseOptions: FirebaseOptions,
  [collectionName, id]: DocKey,
  view: string | undefined,
  options?: {
    readonly revalidateOnMount?: boolean;
  }
): Doc.Type<DD> {
  const [doc, setDoc] = useState<Doc.Type>({ state: 'fetching' });

  const docPath = useMemo(() => makeDocPath(collectionName, id, view), [collectionName, view, id]);

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
      console.log(`${docPath} A`);
      return;
    }

    if (error) {
      setDoc({ reason: error, revalidate: mutate, state: 'error' });
      console.log(`${docPath} B`);
      return;
    }

    if (snapshot.exists) {
      setDoc({
        data: snapshot.data,
        exists: true,
        revalidate: mutate,
        state: 'loaded',
      });
      console.log(`${docPath} C`);
      return;
    }

    console.log(`${docPath} D`);
    setDoc({
      exists: false,
      revalidate: mutate,
      state: 'loaded',
    });
  }, [snapshot, error, mutate]);

  return doc as Doc.Type<DD>;
}
