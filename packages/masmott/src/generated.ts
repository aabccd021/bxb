import { IncrementSpecs, ViewDocMutationGen } from 'masmott';
import { makeIncrementField } from './pure/make-view-doc-mutation';

export const schema = {
  thread: {
    view: {
      page: {
        replyCount: {
          type: 'count',
          count: 'reply',
          groupBy: 'threadId',
        },
      },
    },
  },
  reply: {
    data: {
      threadId: {
        type: 'refId',
        referTo: 'thread',
      },
      text: {
        type: 'string',
      },
    },
  },
};

type ThreadPageData = {
  readonly replyCount: number;
};

type ReplyData = {
  readonly threadId: string;
  readonly text: string;
};

const incrementThreadPageReplyCount: ViewDocMutationGen<ReplyData, 'replyCount', ThreadPageData> = {
  getDocId: (data) => data.threadId,
  makeMutatorCallback: makeIncrementField('replyCount'),
};

export const onReplyCreatedInrement: IncrementSpecs<ReplyData> = {
  thread: {
    page: {
      replyCount: incrementThreadPageReplyCount as ViewDocMutationGen<ReplyData>,
    },
  },
};
