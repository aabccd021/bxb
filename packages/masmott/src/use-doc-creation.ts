import { useCallback, useEffect, useState } from 'react';
import { getId, setDoc } from './firebase';
import {
  makeDocCreationOnSetErrorActions,
  makeDocCreationPreSetActions,
} from './pure';
import {
  CreateDoc,
  DocCreation,
  DocCreationContext,
  DocCreationData,
  DocCreationWithId,
} from './types';
import { useMutateDocs } from './use-mutate-docs';

export function useDocCreation<DCD extends DocCreationData>({
  collectionName,
  firebaseOptions,
  incrementSpecs,
  materializeViews,
}: DocCreationContext<DCD>): DocCreation.Type<DCD> {
  const mutateDocs = useMutateDocs();
  const [state, setState] = useState<DocCreation.Type<DCD>>({
    state: 'initial',
  });

  const reset = useCallback(() => setState({ state: 'initial' }), []);

  const createDoc = useCallback<CreateDoc<DCD>>(
    async (data) => {
      function retry(): void {
        createDoc(data);
      }

      const id = await getId(firebaseOptions, collectionName);
      const createdDoc: DocCreationWithId<DCD> = { id, data };

      setState({ state: 'creating', createdDoc });
      mutateDocs(
        makeDocCreationPreSetActions(
          collectionName,
          id,
          data,
          incrementSpecs,
          materializeViews
        )
      );

      setDoc(firebaseOptions, collectionName, id, data)
        .then(() => setState({ state: 'created', reset, createdDoc }))
        .catch((reason) => {
          setState({
            state: 'error',
            reason,
            reset,
            retry,
          });
          mutateDocs(
            makeDocCreationOnSetErrorActions(
              collectionName,
              id,
              data,
              incrementSpecs,
              materializeViews
            )
          );
        });
    },
    [
      collectionName,
      firebaseOptions,
      incrementSpecs,
      materializeViews,
      mutateDocs,
      reset,
    ]
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
