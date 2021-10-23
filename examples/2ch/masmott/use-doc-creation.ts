import { setDoc } from "firebase/firestore/lite";
import { useCallback, useEffect, useState } from "react";
import { CollectionSpec, Dict } from "./core/types";
import { getDocRef } from "./get-doc-ref";
import { getId } from "./get-id";
import {
  CreateDoc,
  DocCreation,
  DocCreationData,
  DocData,
  DocKey,
} from "./types";
import { useMutateDoc } from "./use-mutate-doc";
import { useUpdateCountViews } from "./use-update-count-views";

export function useDocCreation<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
>(collection: string, spec: Dict<CollectionSpec>): DocCreation<DD, CDD> {
  const mutateDoc = useMutateDoc();

  const incrementCountViews = useUpdateCountViews(collection, spec, 1);

  const [state, setState] = useState<DocCreation>({ state: "initial" });

  const reset = useCallback(() => setState({ state: "initial" }), []);

  const createDoc = useCallback<CreateDoc>(
    (data) => {
      const id = getId(collection);
      const createdDoc = { id, data };
      setState({ state: "creating", createdDoc });
      const docKey: DocKey = [collection, id];
      const docRef = getDocRef(docKey);
      setDoc(docRef, data)
        .then(() => {
          setState({ state: "created", reset, createdDoc });
          mutateDoc(docKey, { exists: true, data });
          incrementCountViews(data);
        })
        .catch((reason) =>
          setState({
            state: "error",
            reason,
            reset,
            retry: () => createDoc(data),
          })
        );
    },
    [collection, incrementCountViews, reset, mutateDoc]
  );

  useEffect(() => {
    if (state.state === "initial") {
      setState({ state: "notCreated", createDoc });
    }
  }, [createDoc, state]);

  return state as DocCreation<DD, CDD>;
}
