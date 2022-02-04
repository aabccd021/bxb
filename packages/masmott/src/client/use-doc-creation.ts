/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
import { Dict, SelectVS, VS } from 'core';
import { NextRouter, useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';

import { getId, setDoc } from './firebase';
import {
  CreateDoc,
  DocCreation,
  DocCreationData,
  DocData,
  DocWithId,
  FirebaseOptions,
} from './types';
import { makeDocPath } from './util';

const materializeViewDocSelectVS = (docData: DocData, select: SelectVS) => {
  const materializedFieldNames = Object.keys(select);
  return Object.entries(docData).filter(([fieldName]) =>
    materializedFieldNames.includes(fieldName)
  );
};

const materializeViewDoc = (docData: DocData, viewSpec: VS) => ({
  ...materializeViewDocSelectVS(docData, viewSpec.select),
});

const useDocCreation = <
  DD extends DocData,
  CDD extends DocCreationData,
  T extends DocCreation.Type<DD, CDD>
>(
  options: FirebaseOptions,
  collection: string,
  viewSpecs: Dict<VS>,
  makeDoc: (createdDoc: DocWithId<DD>, reset: () => void, router: NextRouter) => T
): T => {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [creation, setCreation] = useState<DocCreation.Type>({
    state: 'initial',
  });

  const reset = useCallback(() => setCreation({ state: 'initial' }), []);

  const createDoc = useCallback<CreateDoc>(
    async (data) => {
      const id = await getId(options, collection);

      // set hook state to 'creating'
      const createdDoc = { data: data as DD, id };
      setCreation({ createdDoc, state: 'creating' });

      const docPath = makeDocPath(collection, id);

      const [setDocError] = await Promise.all([
        // send create request
        setDoc(options, collection, id, data),
        // set swr doc cache
        mutate(docPath, data, false),
        // set swr view cache
        ...Object.entries(viewSpecs).map(([viewName, viewSpec]) => {
          const viewDocData = materializeViewDoc(data, viewSpec);
          const viewDocpath = makeDocPath(collection, id, viewName);
          console.log(`path: ${viewDocpath}, data: ${JSON.stringify(viewDocData)}`);
          return mutate(viewDocpath, viewDocData, false);
        }),
      ]);

      if (setDocError === undefined) {
        // set hook state to 'created'
        const doc = makeDoc(createdDoc, reset, router) as DocCreation.Type;
        setCreation(doc);
      } else {
        // set hook state to 'error'
        setCreation({
          reason: setDocError,
          reset,
          retry: () => createDoc(data),
          state: 'error',
        });

        // revert swr cache to undefined
        await mutate(undefined, data, false);
      }
    },
    [reset, options, collection]
  );

  useEffect(() => {
    if (creation.state === 'initial') {
      setCreation({ createDoc, state: 'notCreated' });
    }
  }, [createDoc, creation]);

  return creation as T;
};

export const useDocCreationWithoutPage = <DD extends DocData, CDD extends DocCreationData>(
  options: FirebaseOptions,
  collection: string,
  viewSpecs: Dict<VS>
): DocCreation.TypeWithoutPage<DD, CDD> =>
  useDocCreation<DD, CDD, DocCreation.TypeWithoutPage<DD, CDD>>(
    options,
    collection,
    viewSpecs,
    (createdDoc, reset) => ({
      createdDoc,
      reset,
      state: 'created',
    })
  );

export const useDocCreationWithPage = <DD extends DocData, CDD extends DocCreationData>(
  options: FirebaseOptions,
  collection: string,
  viewSpecs: Dict<VS>
): DocCreation.TypeWithPage<DD, CDD> =>
  useDocCreation<DD, CDD, DocCreation.TypeWithPage<DD, CDD>>(
    options,
    collection,
    viewSpecs,
    (createdDoc, reset, router) => ({
      createdDoc,
      redirect: () =>
        router.push(`/${collection}/${encodeURIComponent(createdDoc.id)}?useLocalData=true`),
      reset,
      state: 'created',
    })
  );
