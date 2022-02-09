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
  DocSnapshot,
  DocWithId,
  FirebaseOptions,
} from './types';
import { makeDocPath } from './util';

const materializeViewDocSelectVS = (docData: DocData, select: SelectVS): DocData => {
  const materializedFieldNames = Object.keys(select);
  return Object.fromEntries(
    Object.entries(docData).filter(([fieldName]) => materializedFieldNames.includes(fieldName))
  );
};

const materializeViewDoc = (docData: DocData, viewSpec: VS): DocData => ({
  ...materializeViewDocSelectVS(docData, viewSpec.select),
});

const makeMaterializedViewDocSnapshot =
  (docData: DocData) =>
  (viewSpec: VS): DocSnapshot => ({
    data: materializeViewDoc(docData, viewSpec),
    exists: true,
  });

const useDocCreation = <
  DD extends DocData,
  CDD extends DocCreationData,
  T extends DocCreation.Type<DD, CDD>
>(
  options: FirebaseOptions,
  collection: string,
  makeDoc: (createdDoc: DocWithId<DD>, reset: () => void, router: NextRouter) => T,
  viewSpecs?: Dict<VS>
): T => {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [creation, setCreation] = useState<DocCreation.Type>({
    state: 'initial',
  });

  const reset = useCallback(() => setCreation({ state: 'initial' }), []);

  const mutateViews = useCallback(
    (id: string, makeViewDocSnapshot: (viewSpec: VS) => DocSnapshot) =>
      Object.entries(viewSpecs ?? {}).map(([viewName, viewSpec]) => {
        const viewDocSnapshot = makeViewDocSnapshot(viewSpec);
        const viewDocpath = makeDocPath(collection, id, viewName);
        console.log(`path: ${viewDocpath}, data: ${JSON.stringify(viewDocSnapshot)}`);
        return mutate(viewDocpath, viewDocSnapshot, false);
      }),
    []
  );

  const createDoc = useCallback<CreateDoc>(
    async (data) => {
      const id = await getId(options, collection);

      // set hook state to 'creating'
      const createdDoc = { data: data as DD, id };
      setCreation({ createdDoc, state: 'creating' });

      const docPath = makeDocPath(collection, id);
      const docSnapshot: DocSnapshot = { data, exists: true };

      const [setDocError] = await Promise.all([
        // send create request
        setDoc(options, collection, id, data),
        // set swr cache
        mutate(docPath, docSnapshot, false),
        ...mutateViews(id, makeMaterializedViewDocSnapshot(data)),
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

        // revert swr caches
        const absentDocSnapshot: DocSnapshot = { exists: false };
        await Promise.all([
          mutate(docPath, absentDocSnapshot, false),
          ...mutateViews(id, () => absentDocSnapshot),
        ]);
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
  viewSpecs?: Dict<VS>
): DocCreation.TypeWithoutPage<DD, CDD> =>
  useDocCreation<DD, CDD, DocCreation.TypeWithoutPage<DD, CDD>>(
    options,
    collection,
    (createdDoc, reset) => ({
      createdDoc,
      reset,
      state: 'created',
    }),
    viewSpecs
  );

export const useDocCreationWithPage = <DD extends DocData, CDD extends DocCreationData>(
  options: FirebaseOptions,
  collection: string,
  viewSpecs?: Dict<VS>
): DocCreation.TypeWithPage<DD, CDD> =>
  useDocCreation<DD, CDD, DocCreation.TypeWithPage<DD, CDD>>(
    options,
    collection,
    (createdDoc, reset, router) => ({
      createdDoc,
      redirect: () =>
        router.push(`/${collection}/${encodeURIComponent(createdDoc.id)}?useLocalData=true`),
      reset,
      state: 'created',
    }),
    viewSpecs
  );
