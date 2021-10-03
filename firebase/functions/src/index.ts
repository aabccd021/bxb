// eslint-disable-next-line no-restricted-imports
import * as admin from 'firebase-admin';
import { makeMasmottTriggers } from './get-trigger';

admin.initializeApp();

export const triggers = makeMasmottTriggers({
  user: {
    src: {
      id: {
        type: 'string',
      },
      username: {
        type: 'string',
      },
    },
    views: {
      card: {
        selectedFieldNames: ['id'],
        join: [],
      },
    },
  },
  tweet: {
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
  reply: {
    src: {
      text: {
        type: 'string',
      },

      repliedTweet: {
        type: 'refId',
        refCollection: 'tweet',
      },
    },
    views: {
      card: {
        selectedFieldNames: ['text'],
        join: [
          {
            firstRef: {
              collectionName: 'tweet',
              fieldName: 'repliedTweet',
            },
            refChain: [
              {
                collectionName: 'user',
                fieldName: 'owner',
              },
            ],
            selectedFieldNames: ['username'],
          },
        ],
      },
    },
  },
});
