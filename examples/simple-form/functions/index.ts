import { initializeApp } from "firebase-admin/app";
import * as functions from "firebase-functions";
import next from "next";
import * as conf from "../next.config";

initializeApp();

const nextjsServer = next({ dev: false, conf });

const nextjsHandle = nextjsServer.getRequestHandler();

export const nextjs = functions.https.onRequest((request, response) =>
  nextjsServer.prepare().then(() => nextjsHandle(request, response))
);
