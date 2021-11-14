import { useCallback, useEffect, useState } from 'react';
import { getId, setDoc } from './firebase';
import { makeMaterializedDocs } from './pure/make-materialized-docs';
import { CreateDoc, DocCreation, DocCreationData, DocData, FirebaseOptions } from './types';
import { CollectionViews, Schema } from './types/io';
import { useMutateDocWithId } from './use-mutate-doc';
import { useUpdateCountViews } from './use-update-count-views';

export function useDocCreation<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
>(
  firebaseOptions: FirebaseOptions,
  collection: string,
  schema: Schema,
  collectionViews: CollectionViews
): DocCreation.Type<DD, CDD> {
  const mutateDocWithId = useMutateDocWithId(collection);
  const incrementCountViews = useUpdateCountViews(collection, schema, 1);
  const [creation, setCreation] = useState<DocCreation.Type>({ state: 'initial' });
  const reset = useCallback(() => setCreation({ state: 'initial' }), []);

  const createDoc = useCallback<CreateDoc>(
    async (data) => {
      const id = await getId(firebaseOptions, collection);
      const createdDoc = { id, data };
      setCreation({ state: 'creating', createdDoc });
      setDoc(firebaseOptions, collection, id, data)
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
    [incrementCountViews, reset, mutateDocWithId, firebaseOptions, collection, collectionViews]
  );

  useEffect(() => {
    if (creation.state === 'initial') {
      setCreation({ state: 'notCreated', createDoc });
    }
  }, [createDoc, creation]);

  return creation as DocCreation.Type<DD, CDD>;
}
