import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import { useCallback, useEffect, useState } from 'react';
import { getId, setDoc } from './firebase';
import {
  CreateDoc,
  Dict,
  DocCreation,
  DocCreationData,
  DocData,
  DocSnapshot,
  FirebaseOptions,
  Spec,
  ViewSpec,
} from './types';
import { useMutateDocWithId } from './use-mutate-doc';
import { useUpdateCountViews } from './use-update-count-views';

export function useDocCreation<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
>(
  options: FirebaseOptions,
  collection: string,
  spec: Spec,
  views: Dict<ViewSpec>
): DocCreation.Type<DD, CDD> {
  const mutateDocWithId = useMutateDocWithId(collection);
  const incrementCountViews = useUpdateCountViews(collection, spec, 1);
  const [creation, setCreation] = useState<DocCreation.Type>({ state: 'initial' });
  const reset = useCallback(() => setCreation({ state: 'initial' }), []);

  const createViews = useCallback(
    (id: string, data: DocData) => {
      Object.entries(views).forEach(([view, viewSpec]) => {
        const materializedSelects = pick(data, viewSpec.selectedFieldNames);
        const materializedCounts = mapValues(viewSpec.countSpecs, () => 0);
        const materializedData: DocData = {
          ...materializedSelects,
          ...materializedCounts,
        };
        const materializedDoc: DocSnapshot = {
          exists: true,
          data: materializedData,
        };
        mutateDocWithId(id, materializedDoc, { view });
      });
    },
    [mutateDocWithId, views]
  );

  const createDoc = useCallback<CreateDoc>(
    async (data) => {
      const id = await getId(options, collection);
      const createdDoc = { id, data };
      setCreation({ state: 'creating', createdDoc });
      setDoc(options, collection, id, data)
        .then(() => {
          setCreation({ state: 'created', reset, createdDoc });
          mutateDocWithId(id, { exists: true, data });
          incrementCountViews(data);
          createViews(id, data);
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
    [incrementCountViews, reset, mutateDocWithId, createViews, options, collection]
  );

  useEffect(() => {
    if (creation.state === 'initial') {
      setCreation({ state: 'notCreated', createDoc });
    }
  }, [createDoc, creation]);

  return creation as DocCreation.Type<DD, CDD>;
}
