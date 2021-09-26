import * as admin from 'firebase-admin';
import { getTrigger } from './get-trigger';

admin.initializeApp();

export const triggers = getTrigger({
  user: {
    src: [
      {
        name: 'id',
        spec: {
          type: 'string',
        },
      },
      {
        name: 'username',
        spec: {
          type: 'string',
        },
      },
    ],
    views: {
      card: {
        selectedFieldNames: ['id'],
        joinSpecs: [],
      },
    },
  },
  tweet: {
    src: [
      {
        name: 'text',
        spec: {
          type: 'string',
        },
      },
      {
        name: 'owner',
        spec: {
          type: 'ref',
          collection: 'user',
        },
      },
    ],
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
    src: [
      {
        name: 'text',
        spec: { type: 'string' },
      },
      {
        name: 'repliedTweet',
        spec: {
          type: 'ref',
          collection: 'tweet',
        },
      },
    ],
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
