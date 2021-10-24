import { makeFunctions } from "masmott-functions";
import conf from "../next.config";

const { nextjs, firestore } = makeFunctions(conf, {
  thread: {
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
  },
  reply: {
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
  },
});

export { nextjs, firestore };
