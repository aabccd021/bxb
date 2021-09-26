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
            refCollectionName: 'user',
            refFieldName: 'owner',
            selectedFieldNames: ['username'],
          },
        ],
      },
    ],
  },
]);
