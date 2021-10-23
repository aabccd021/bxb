import { initializeApp } from "firebase-admin/app";
import { makeMasmottTriggers } from "masmott-server";

const app = initializeApp();

export const masmott = makeMasmottTriggers(app, {
  post: {
    src: {
      text: {
        type: "string",
      },
    },
    views: {},
  },
});
