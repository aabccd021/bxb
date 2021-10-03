// eslint-disable-next-line no-restricted-imports
import * as admin from 'firebase-admin';
import { makeMasmottTriggers } from './get-trigger';

admin.initializeApp();

export const triggers = makeMasmottTriggers(admin.firestore(), {
  user: {
    src: {
      id: {
        type: 'string',
      },
      bio: {
        type: 'string',
      },
    },
    views: {
      card: {
        selectedFieldNames: ['bio'],
        join: [],
      },
    },
  },
  article: {
    src: {
      text: {
        type: 'string',
      },
      owner: {
        type: 'refId',
        refCollection: 'user',
      },
    },
    views: {
      card: {
        selectedFieldNames: ['text'],
        join: [
          {
            firstRef: {
              collectionName: 'user',
              fieldName: 'owner',
            },
            refChain: [],
            selectedFieldNames: ['username'],
          },
        ],
      },
    },
  },
});
