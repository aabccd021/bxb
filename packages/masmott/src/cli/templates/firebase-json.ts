import * as fs from 'fs';

import { jsonStringify } from './utils';

export const firebaseJson = () => {
  const ignoreString = fs.readdirSync('.', { withFileTypes: true }).map((file) => file.name);
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
    functions: {
      ignore: ignoreString,
      source: '.',
    },
    hosting: {
      cleanUrls: true,
      ignore: ignoreString,
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
