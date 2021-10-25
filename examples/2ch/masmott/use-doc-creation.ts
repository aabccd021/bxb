import { setDoc } from 'firebase/firestore/lite';
import { Spec } from 'masmott-functions';
import { useCallback, useEffect, useState } from 'react';
import { getDocRef } from './get-doc-ref';
import { getId } from './get-id';
import { CreateDoc, DocCreation, DocCreationData, DocData, DocKey } from './types';
import { useMutateDoc } from './use-mutate-doc';
import { useUpdateCountViews } from './use-update-count-views';

export function useDocCreation<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
>(collection: string, spec: Spec): DocCreation.Type<DD, CDD> {
  const mutateDoc = useMutateDoc();

  const incrementCountViews = useUpdateCountViews(collection, spec, 1);

  const [creation, setCreation] = useState<DocCreation.Type>({ state: 'initial' });

  const reset = useCallback(() => setCreation({ state: 'initial' }), []);

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
    [collection, incrementCountViews, reset, mutateDoc]
  );

  useEffect(() => {
    if (creation.state === 'initial') {
      setCreation({ state: 'notCreated', createDoc });
    }
  }, [createDoc, creation]);

  return creation as DocCreation.Type<DD, CDD>;
}
