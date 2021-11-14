import { useCallback, useEffect, useState } from 'react';
import { getId, setDoc } from './firebase';
import { makeMaterializedDocs } from './pure/make-materialized-docs';
import {
  CreateDoc,
  DocCreation,
  DocCreationData,
  DocCreationWithId,
  FirebaseOptions,
  IncrementSpecs,
} from './types';
import { CollectionViews } from './types/io';
import { useMutateDocWithId } from './use-mutate-doc';
import { useUpdateCountViews } from './use-update-count-views';

export function useDocCreation<DCD extends DocCreationData = DocCreationData>(
  collectionName: string,
  collectionViews: CollectionViews,
  firebaseOptions: FirebaseOptions,
  incrementSpecs: IncrementSpecs<DCD>
): DocCreation.Type<DCD> {
  const mutateDocWithId = useMutateDocWithId(collectionName);
  const incrementCountViews = useUpdateCountViews<DCD>(incrementSpecs);
  const [state, setState] = useState<DocCreation.Type<DCD>>({ state: 'initial' });
  const reset = useCallback(() => setState({ state: 'initial' }), []);

  const createDoc = useCallback<CreateDoc<DCD>>(
    async (data) => {
      const id = await getId(firebaseOptions, collectionName);
      const createdDoc: DocCreationWithId<DCD> = { id, data };
      setState({ state: 'creating', createdDoc });

      // add doc to cache
      mutateDocWithId(id, { exists: true, data });

      incrementCountViews(data, 1);

      // materialize views
      const materializedDocs = makeMaterializedDocs(data, collectionViews);
      materializedDocs.forEach((materializedDoc) =>
        mutateDocWithId(id, materializedDoc.snapshot, { viewName: materializedDoc.viewName })
      );

      setDoc(firebaseOptions, collectionName, id, data)
        .then(() => setState({ state: 'created', reset, createdDoc }))
        .catch((reason) => {
          setState({
            state: 'error',
            reason,
            reset,
            retry: () => createDoc(data),
          });
          mutateDocWithId(id, { exists: false });

          incrementCountViews(data, -1);

          // materialize views
          materializedDocs.forEach((materializedDoc) =>
            mutateDocWithId(id, { exists: false }, { viewName: materializedDoc.viewName })
          );
        });
    },
    [incrementCountViews, reset, mutateDocWithId, firebaseOptions, collectionName, collectionViews]
  );

  useEffect(() => {
    if (state.state === 'initial') {
      setState({
        state: 'notCreated',
        createDoc,
      });
    }
  }, [createDoc, state]);

  return state as DocCreation.Type<DCD>;
}
