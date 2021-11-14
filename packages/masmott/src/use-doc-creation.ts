import { useCallback, useEffect, useState } from 'react';
import { getId, setDoc } from './firebase';
import { Materialize, materializeDocs } from './pure/make-materialized-docs';
import {
  CreateDoc,
  Dict,
  DocCreation,
  DocCreationData,
  DocCreationWithId,
  FirebaseOptions,
  IncrementSpecs,
} from './types';
import { useMutateDocWithId } from './use-mutate-doc';
import { useUpdateCountViews } from './use-update-count-views';

export type DocCreationContext<DCD extends DocCreationData> = {
  readonly collectionName: string;
  readonly firebaseOptions: FirebaseOptions;
  readonly incrementSpecs: IncrementSpecs<DCD>;
  readonly materializeViews: Dict<Materialize<DCD>>;
};

export function useDocCreation<DCD extends DocCreationData>({
  collectionName,
  firebaseOptions,
  incrementSpecs,
  materializeViews,
}: DocCreationContext<DCD>): DocCreation.Type<DCD> {
  const mutateDocWithId = useMutateDocWithId(collectionName);
  const incrementCountViews = useUpdateCountViews<DCD>(incrementSpecs);
  const [state, setState] = useState<DocCreation.Type<DCD>>({ state: 'initial' });
  const reset = useCallback(() => setState({ state: 'initial' }), []);

  const createDoc = useCallback<CreateDoc<DCD>>(
    async (data) => {
      incrementCountViews(data, 1);

      const id = await getId(firebaseOptions, collectionName);
      const createdDoc: DocCreationWithId<DCD> = { id, data };

      setState({ state: 'creating', createdDoc });
      mutateDocWithId(id, { exists: true, data });

      const materializedDocs = materializeDocs(materializeViews, data);
      materializedDocs.forEach((materializedDoc) =>
        mutateDocWithId(
          id,
          { exists: true, data: materializedDoc.data },
          { viewName: materializedDoc.viewName }
        )
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

          const viewNames = Object.keys(materializeViews);
          viewNames.forEach((viewName) => mutateDocWithId(id, { exists: false }, { viewName }));
        });
    },
    [incrementCountViews, reset, mutateDocWithId, firebaseOptions, collectionName, materializeViews]
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
