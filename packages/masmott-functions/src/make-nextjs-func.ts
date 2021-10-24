import { https, HttpsFunction } from 'firebase-functions';
import next, { NextConfig } from 'next';

export function makeNextjsFunction(conf: NextConfig): HttpsFunction {
  const nextjsServer = next({ dev: false, conf });

  const nextjsHandle = nextjsServer.getRequestHandler();

  const nextjsFunc = https.onRequest((request, response) =>
    nextjsServer.prepare().then(() => nextjsHandle(request, response))
  );

  return nextjsFunc;
}
