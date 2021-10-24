import { initializeApp } from "firebase-admin/app";
import { makeMasmottTriggers } from "masmott-server";

const app = initializeApp();

export const trigger = makeMasmottTriggers(app, {
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
