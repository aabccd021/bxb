import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { MutateSetDoc } from "./types";

export function useMutateDoc(): MutateSetDoc {
  const { mutate } = useSWRConfig();
  const mutateDoc = useCallback<MutateSetDoc>(
    async ([collectionName, id], data, shouldRevalidate) => {
      const path = `${collectionName}/${id}`;
      await mutate(path, data, shouldRevalidate);
    },
    [mutate]
  );
  return mutateDoc;
}
