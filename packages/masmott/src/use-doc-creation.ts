import { setDoc } from 'firebase/firestore/lite';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import { useCallback, useEffect, useState } from 'react';
import { getDocRef } from './get-doc-ref';
import { getId } from './get-id';
import {
  CreateDoc,
  Dict,
  DocCreation,
  DocCreationData,
  DocData,
  DocKey,
  Spec,
  ViewSpec,
} from './types';
import { useDocSWRConfig } from './use-doc-swr-config';
import { useUpdateCountViews } from './use-update-count-views';

export function useDocCreation<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
>(collection: string, spec: Spec, views: Dict<ViewSpec>): DocCreation.Type<DD, CDD> {
  const { mutateDoc } = useDocSWRConfig();

  const incrementCountViews = useUpdateCountViews(collection, spec, 1);

  const [creation, setCreation] = useState<DocCreation.Type>({ state: 'initial' });

  const reset = useCallback(() => setCreation({ state: 'initial' }), []);

  const createViews = useCallback(
    (id: string, data: DocData) => {
      Object.entries(views).forEach(([view, viewSpec]) => {
        const materializedSelects = pick(data, viewSpec.selectedFieldNames);
        const materializedCounts = mapValues(viewSpec.countSpecs, () => 0);
        const materializedData = {
          ...materializedSelects,
          ...materializedCounts,
        };
        const materializedDoc = {
          exists: true,
          data: materializedData,
        };
        const viewDocKey: DocKey = [collection, id];
        mutateDoc(viewDocKey, materializedDoc, { view });
      });
    },
    [collection, mutateDoc, views]
  );

  const createDoc = useCallback<CreateDoc>(
    (data) => {
      const id = getId(collection);
      const createdDoc = { id, data };
      setCreation({ state: 'creating', createdDoc });
      const docKey: DocKey = [collection, id];
      const docRef = getDocRef(docKey);
      setDoc(docRef, data)
        .then(() => {
          setCreation({ state: 'created', reset, createdDoc });
          mutateDoc(docKey, { exists: true, data });
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
    [collection, incrementCountViews, reset, mutateDoc, createViews]
  );

  useEffect(() => {
    if (creation.state === 'initial') {
      setCreation({ state: 'notCreated', createDoc });
    }
  }, [createDoc, creation]);

  return creation as DocCreation.Type<DD, CDD>;
}
