/* eslint-disable @typescript-eslint/ban-types */
import { DocCreationContext, FirebaseOptions, ViewDocMutationGen } from 'masmott';
import { makeMaterialize, Materialize } from './pure/make-materialized-docs';
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

type ThreadData = {
  readonly description: number;
};

type ThreadCreationData = {
  readonly id: number;
  readonly description: string;
};

type ReplyData = {
  readonly threadId: string;
  readonly text: string;
};

type ReplyCreationData = {
  readonly threadId: string;
  readonly text: string;
};

const materializeThreadPage = makeMaterialize<ThreadCreationData, never, 'replyCount'>(
  [],
  ['replyCount']
);

export type ThreadPageData = ReturnType<typeof materializeThreadPage>;

const materializeThreadCard = makeMaterialize<ThreadCreationData, 'description', never>(
  ['description'],
  []
);

export type ThreadCardData = ReturnType<typeof materializeThreadCard>;

const incrementThreadPageReplyCount: ViewDocMutationGen<ReplyData, 'replyCount', ThreadPageData> = {
  getDocId: (data) => data.threadId,
  makeMutatorCallback: makeIncrementField('replyCount'),
};

const firebaseOptions: FirebaseOptions = {
  projectId: '',
};

export const replyCreationContext: DocCreationContext<ReplyCreationData> = {
  collectionName: 'reply',
  firebaseOptions,
  incrementSpecs: {
    thread: {
      page: {
        replyCount: incrementThreadPageReplyCount as ViewDocMutationGen<ReplyData>,
      },
    },
  },
  materializeViews: {},
};

export const threadCreationContext: DocCreationContext<ThreadCreationData> = {
  collectionName: 'thread',
  firebaseOptions,
  incrementSpecs: {},
  materializeViews: {
    page: materializeThreadPage as Materialize<ThreadCreationData>,
    card: materializeThreadCard as Materialize<ThreadCreationData>,
  },
};

// const threadDocCreation = useDocCreation<ThreadCreationData>(threadCreationContext);
