/* istanbul ignore file */
// NOTE: This file should not be edited

import { Spec } from 'masmott-functions';
import { Doc, DocCreation, useDoc, useDocCreation, useMasmottWithOption } from './masmott';

export const spec = {
  thread: {
    src: {},
    views: {
      page: {
        selectedFieldNames: [],
        joinSpecs: {},
        countSpecs: {
          replyCount: {
            countedCollectionName: 'reply',
            groupBy: 'threadId',
          },
        },
      },
    },
  },
  reply: {
    src: {
      threadId: {
        type: 'refId',
        refCollection: 'thread',
      },
      text: {
        type: 'string',
      },
    },
    views: {},
  },
};

export type ThreadData = Record<string, never>;

export type ThreadCreationData = Record<string, never>;

export type ThreadPageData = {
  readonly replyCount: number;
};

export type ReplyData = {
  readonly threadId: string;
  readonly text: string;
};

export type ReplyCreationData = {
  readonly threadId: string;
  readonly text: string;
};

export type ThreadCreation = DocCreation.Type<ThreadData, ThreadCreationData>;

export function useThreadCreation(): ThreadCreation {
  return useDocCreation('thread', spec as Spec);
}

export type ReplyCreation = DocCreation.Type<ReplyData, ReplyCreationData>;

export function useReplyCreation(): ReplyCreation {
  return useDocCreation('reply', spec as Spec);
}

export type ThreadDoc = Doc.Type<ThreadData>;

export function useThread(id: string): ThreadDoc {
  return useDoc(['thread', id], undefined);
}

export type ThreadPage = Doc.Type<ThreadPageData>;

export type TheradPageSnapshot = {
  readonly id: string;
  readonly doc: ThreadPage;
};

export function useThreadPage(id: string): ThreadPage {
  return useDoc(['thread', id], 'page');
}

export type ReplyDoc = Doc.Type<ReplyData>;

export function useReply(id: string): ReplyDoc {
  return useDoc(['reply', id], undefined);
}

const options = {
  projectId: 'demo-2ch',
};

export function useMasmott(): void {
  return useMasmottWithOption(options);
}
