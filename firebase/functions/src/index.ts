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
        joinSpecs: [],
      },
    },
  },
  tweet: {
    src: {
      text: {
        type: 'string',
      },
      owner: {
        type: 'ref',
        refCollection: 'user',
      },
    },
    views: {
      card: {
        selectedFieldNames: ['text'],
        joinSpecs: [
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
        type: 'ref',
        refCollection: 'tweet',
      },
    },
    views: {
      card: {
        selectedFieldNames: ['text'],
        joinSpecs: [
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
