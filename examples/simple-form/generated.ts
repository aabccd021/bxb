import { CollectionSpec } from "./masmott/core/types";
import { Doc, DocCreation } from "./masmott/types";
import { useDoc } from "./masmott/use-doc";
import { useDocCreation } from "./masmott/use-doc-creation";

export type PostData = {
  readonly text: string;
};

export type PostCreationData = {
  readonly text: string;
};

export const post: CollectionSpec = {
  src: {
    text: {
      type: "string",
    },
  },
  views: {},
};

export const schema = {
  post,
};

export type PostCreation = DocCreation<PostData, PostCreationData>;

export function usePostCreation(): PostCreation {
  return useDocCreation("post", schema);
}

export type PostDoc = Doc<PostData>;

export function usePost(id: string): PostDoc {
  return useDoc(["post", id], undefined);
}
