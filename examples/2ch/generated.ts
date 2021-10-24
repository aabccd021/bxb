// NOTE: This file should not be edited

import {
  CollectionSpec,
  Doc,
  DocCreation,
  DocCreation_NotCreatedComponent,
  useDoc,
  useDocCreation,
  useMasmottWithOption,
} from "./masmott";

export const thread: CollectionSpec = {
  src: {},
  views: {
    detail: {
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

export const schema = {
  thread,
  reply,
};

export type ThreadData = Record<string, never>;

export type ThreadCreationData = Record<string, never>;

export type ThreadDetailData = {
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

export type ThreadCreation = DocCreation<ThreadData, ThreadCreationData>;

export function useThreadCreation(): ThreadCreation {
  return useDocCreation("thread", schema);
}

export type ReplyCreation = DocCreation<ReplyData, ReplyCreationData>;

export function useReplyCreation(): ReplyCreation {
  return useDocCreation("reply", schema);
}

export type ThreadDoc = Doc<ThreadData>;

export function useThread(id: string): ThreadDoc {
  return useDoc(["thread", id], undefined);
}

export type ThreadDetail = Doc<ThreadDetailData>;

export function useThreadDetail(id: string): ThreadDetail {
  return useDoc(["thread", id], "detail");
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

export type ThreadCreation_NotCreatedComponent =
  DocCreation_NotCreatedComponent<ThreadCreationData>;
