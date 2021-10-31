/* istanbul ignore file */

import { FirebaseOptions } from 'masmott';

export const firebaseOptions: FirebaseOptions = { projectId: 'demo-2ch' };

export const spec = {
  thread: { src: {}, views: {} },
  reply: {
    src: { threadId: { type: 'refId', refCollection: 'thread' }, text: { type: 'string' } },
    views: {},
  },
};
