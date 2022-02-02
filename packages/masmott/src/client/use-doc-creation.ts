/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
import { useCallback, useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';

import { getId, setDoc } from './firebase';
import { CreateDoc, DocCreation, FirebaseOptions } from './types';
import { makeDocPath } from './util';

export function useDocCreation(options: FirebaseOptions, collection: string): DocCreation.Type {
  const { mutate } = useSWRConfig();

  const [creation, setCreation] = useState<DocCreation.Type>({
    state: 'initial',
  });

  const reset = useCallback(() => setCreation({ state: 'initial' }), []);

  const createDoc = useCallback<CreateDoc>(
    async (data) => {
      const id = await getId(options, collection);
      const createdDoc = { data, id };
      setCreation({ createdDoc, state: 'creating' });
      const setDocError = await setDoc(options, collection, id, data);
      if (setDocError === undefined) {
        setCreation({ createdDoc, reset, state: 'created' });
        const docPath = makeDocPath(collection, id);
        await mutate(docPath, data, false);
      } else {
        setCreation({
          reason: setDocError,
          reset,
          retry: () => createDoc(data),
          state: 'error',
        });
      }
    },
    [reset, options, collection]
  );

  useEffect(() => {
    if (creation.state === 'initial') {
      setCreation({ createDoc, state: 'notCreated' });
    }
  }, [createDoc, creation]);

  return creation;
}
