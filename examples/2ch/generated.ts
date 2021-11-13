/* istanbul ignore file */

import type { Doc, DocCreation, FirebaseOptions, Spec } from 'masmott';
import { useDoc, useDocCreation } from 'masmott';

export const options: FirebaseOptions = { projectId: 'demo-2ch' };

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
  return useDocCreation(options, 'thread', spec as Spec, spec.thread.views);
}

export type ReplyCreation = DocCreation.Type<ReplyData, ReplyCreationData>;

export function useReplyCreation(): ReplyCreation {
  return useDocCreation(options, 'reply', spec as Spec, spec.reply.views);
}

export type ThreadDoc = Doc.Type<ThreadData>;

export function useThread(id: string): ThreadDoc {
  return useDoc(options, ['thread', id]);
}

export type ThreadPage = Doc.Type<ThreadPageData>;

export type ThreadPageSnapshot = {
  readonly id: string;
  readonly doc: ThreadPage;
};

export function useThreadPage(id: string): ThreadPage {
  return useDoc(options, ['thread', id], { view: 'page' });
}

export type ReplyDoc = Doc.Type<ReplyData>;

export function useReply(id: string): ReplyDoc {
  return useDoc(options, ['reply', id], undefined);
}
