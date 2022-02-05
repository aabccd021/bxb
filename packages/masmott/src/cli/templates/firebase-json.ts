import * as fs from 'fs';

import { jsonStringify } from './utils';

export const firebaseJson = (cwd: readonly fs.Dirent[]) => {
  const ignore = cwd.map((file) => file.name);
  return jsonStringify({
    emulators: {
      firestore: {
        port: 8080,
      },
      functions: {
        port: 5001,
      },
      hosting: {
        port: 5000,
      },
      ui: {
        enabled: true,
      },
    },
    firestore: {
      // indexes: '.masmott/firestore/firestore.indexes.json',
      rules: '.masmott/firestore/firestore.rules',
    },
    functions: {
      ignore,
      source: '.',
    },
    hosting: {
      cleanUrls: true,
      ignore,
      public: 'public',
      rewrites: [
        {
          function: 'nextjs',
          source: '**',
        },
      ],
    },
  });
};
