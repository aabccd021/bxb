// NOTE: This file should not be edited

import {
  CollectionSpec,
  Doc,
  DocCreation,
  useDoc,
  useDocCreation,
  useMasmottWithOption,
} from "./masmott";

export const thread: CollectionSpec = {
  src: {},
  views: {
    page: {
      selectedFieldNames: [],
      joinSpecs: {},
      countSpecs: {
        replyCount: {
          countedCollectionName: "reply",
          groupBy: "threadId",
        },
      },
    },
  },
};

export const reply: CollectionSpec = {
  src: {
    threadId: {
      type: "refId",
      refCollection: "thread",
    },
    text: {
      type: "string",
    },
  },
  views: {},
};

export const spec = {
  thread,
  reply,
};

export type ThreadData = Record<string, never>;

export type ThreadCreationData = Record<string, never>;

export type ThreadPageData = {
  readonly replyCount: number;
};

export type ReplyData = {
  readonly theadId: string;
  readonly text: string;
};

export type ReplyCreationData = {
  readonly theadId: string;
  readonly text: string;
};

export type ThreadCreation = DocCreation.Type<ThreadData, ThreadCreationData>;

export function useThreadCreation(): ThreadCreation {
  return useDocCreation("thread", spec);
}

// export type ReplyCreation = DocCreation<ReplyData, ReplyCreationData>;

// export function useReplyCreation(): ReplyCreation {
//   return useDocCreation("reply", schema);
// }

export type ThreadDoc = Doc<ThreadData>;

export function useThread(id: string): ThreadDoc {
  return useDoc(["thread", id], undefined);
}

export type ThreadPage = Doc<ThreadPageData>;

export function useThreadPage(id: string): ThreadPage {
  return useDoc(["thread", id], "page");
}

export type ReplyDoc = Doc<ReplyData>;

export function useReply(id: string): ReplyDoc {
  return useDoc(["reply", id], undefined);
}

const options = {
  projectId: "demo-2ch",
};

export function useMasmott(): void {
  return useMasmottWithOption(options);
}

export type ThreadCreation_Creating = DocCreation.CreatingComponent<ThreadData>;
export type ThreadCreation_Created = DocCreation.CreatedComponent<ThreadData>;
export type ThreadCreation_Error = DocCreation.ErrorComponent;
export type ThreadCreation_Initial = DocCreation.InitialComponent;
export type ThreadCreation_NotCreated =
  DocCreation.NotCreatedComponent<ThreadCreationData>;
