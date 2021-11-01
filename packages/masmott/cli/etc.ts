export const firebase = {
  emulators: {
    firestore: {
      port: 8080,
    },
    hosting: {
      port: 5000,
    },
    ui: {
      enabled: true,
    },
    auth: {
      port: 9099,
    },
    functions: {
      port: 5001,
    },
    storage: {
      port: 9199,
    },
  },
  firestore: {
    rules: 'firestore.rules',
    indexes: 'firestore.indexes.json',
  },
  functions: {
    source: '.',
    ignore: [
      'firebase.json',
      'firbease-debug.log',
      '**/.*',
      '**/node_modules/**',
      'pages/**',
      'public/**',
      'firestore.rules',
      'README.md',
    ],
  },
  hosting: [
    {
      public: 'public',
      cleanUrls: true,
      ignore: [
        'firebase.json',
        'firestore.indexes.json',
        'firestore.rules',
        'storage.rules',
        'remoteconfig.template.json',
        'tsconfig.json',
        'tsconfig.functions.json',
        'README.md',
        '**/node_modules/**',
        '.github/**',
        '.firebase/**',
        'pages/**',
      ],
      rewrites: [
        {
          source: '**',
          function: 'nextjs',
        },
      ],
    },
  ],
};

export const cypress = {
  baseUrl: 'http://localhost:5000',
  video: false,
  env: {
    codeCoverage: {
      url: '/api/__coverage__',
    },
  },
};

export const firestoreIndex = {
  indexes: [],
  fieldOverrides: [],
};

export const babelrc = {
  presets: ['next/babel'],
  plugins: ['istanbul'],
};

export const firestoreRules = `
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // This rule allows anyone with your database reference to view, edit,
      // and delete all data in your database. It is useful for getting
      // started, but it is configured to expire after 30 days because it
      // leaves your app open to attackers. At that time, all client
      // requests to your database will be denied.
      //
      // Make sure to write security rules for your app before that time, or
      // else all client requests to your database will be denied until you
      // update your rules.
      allow read, write: if request.time < timestamp.date(2021, 11, 16);
    }
  }
}
`;

export const nextEnv = `
/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;

export const nextCOnfig = `
module.exports = {
  reactStrictMode: true,
  redirects: () => {
    return [
      {
        source: '/',
        destination: '/thread/new',
        permanent: false,
      },
    ]
  }
}
`;

export const cypressPlugins = `
module.exports = (on, config) => {
	require('@cypress/code-coverage/task')(on, config)
	// IMPORTANT to return the config object
	// with the any changed environment variables
	return config
}
`;

export const cypressSupport = `import '@cypress/code-coverage/support';`;

export const cypressTsconfig = {
  compilerOptions: {
    target: 'es5',
    lib: ['es5', 'dom'],
    types: ['cypress'],
  },
  include: ['**/*.ts'],
};

export const apiCoverage = `/* istanbul ignore file */
module.exports = require('@cypress/code-coverage/middleware/nextjs')`;

export function pageId(): string {
  return `/* istanbul ignore file */
import { makeISRPage, ViewPath } from 'masmott';
import { makeGetStaticPaths, makeGetStaticProps } from 'masmott/server';
import { options, ThreadPageData } from '../../generated';
import Page from '../../web/thread/[id]';
const viewPath: ViewPath = ['thread', 'page'];
const ISRPage = makeISRPage<ThreadPageData>(options, viewPath, Page);
export default ISRPage;
export const getStaticPaths = makeGetStaticPaths();
export const getStaticProps = makeGetStaticProps(viewPath);`;
}

export function page(): string {
  return `/* istanbul ignore file */
import Page from '../../web/thread/new';

export default Page;`;
}
