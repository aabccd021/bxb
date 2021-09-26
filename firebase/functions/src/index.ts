import * as admin from 'firebase-admin';
import { getTrigger } from './get-trigger';

admin.initializeApp();

export const triggers = getTrigger([
  {
    collectionName: 'user',
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
    view: [
      {
        viewName: 'card',
        selectedFieldNames: ['id'],
        joinSpecs: [],
      },
    ],
  },
  {
    collectionName: 'tweet',
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
    view: [
      {
        viewName: 'card',
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
    ],
  },
  {
    collectionName: 'reply',
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
    view: [
      {
        viewName: 'card',
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
    ],
  },
]);
