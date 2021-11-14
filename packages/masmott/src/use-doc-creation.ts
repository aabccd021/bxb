import { useCallback, useEffect, useState } from 'react';
import { getId, setDoc } from './firebase';
import { makeMaterializedDocs } from './pure/make-materialized-docs';
import {
  CreateDoc,
  DocCreation,
  DocCreationData,
  DocData,
  DocWithId,
  FirebaseOptions,
  IncrementSpecs,
} from './types';
import { CollectionViews } from './types/io';
import { useMutateDocWithId } from './use-mutate-doc';
import { useUpdateCountViews } from './use-update-count-views';

export function useDocCreation<
  DD extends DocData = DocData,
  DCD extends DocCreationData = DocCreationData
>(
  collectionName: string,
  collectionViews: CollectionViews,
  firebaseOptions: FirebaseOptions,
  incrementSpecs: IncrementSpecs<DCD>
): DocCreation.Type<DD, DCD> {
  const mutateDocWithId = useMutateDocWithId(collectionName);
  const incrementCountViews = useUpdateCountViews<DCD>(1, incrementSpecs);
  const [creation, setCreation] = useState<DocCreation.Type>({ state: 'initial' });
  const reset = useCallback(() => setCreation({ state: 'initial' }), []);

  const createDoc = useCallback<CreateDoc<DCD>>(
    async (data) => {
      const id = await getId(firebaseOptions, collectionName);
      const createdDoc: DocWithId = { id, data };
      setCreation({ state: 'creating', createdDoc });
      setDoc(firebaseOptions, collectionName, id, data)
        .then(() => {
          setCreation({ state: 'created', reset, createdDoc });

          // add doc to cache
          mutateDocWithId(id, { exists: true, data });

          incrementCountViews(data);

          // create views
          const materializedDocs = makeMaterializedDocs(data, collectionViews);
          materializedDocs.forEach(({ materializedDoc, viewName }) =>
            mutateDocWithId(id, materializedDoc, { viewName })
          );
        })
        .catch((reason) =>
          setCreation({
            state: 'error',
            reason,
            reset,
            retry: () => createDoc(data),
          })
        );
    },
    [incrementCountViews, reset, mutateDocWithId, firebaseOptions, collectionName, collectionViews]
  );

  useEffect(() => {
    if (creation.state === 'initial') {
      setCreation({
        state: 'notCreated',
        createDoc: createDoc as CreateDoc,
      });
    }
  }, [createDoc, creation]);

  return creation as DocCreation.Type<DD, DCD>;
}
