// eslint-disable-next-line no-restricted-imports
import * as admin from 'firebase-admin';
import { makeMasmottTriggers } from './get-trigger';

admin.initializeApp();

export const triggers = makeMasmottTriggers(admin.firestore(), {
  user: {
    src: {
      uid: {
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
        count: [
          {
            fieldName: 'articleCount',
            countedCollectionName: 'article',
            groupBy: 'ownerUser',
          },
        ],
      },
    },
  },
  article: {
    src: {
      text: {
        type: 'string',
      },
      ownerUser: {
        type: 'refId',
        refCollection: 'user',
      },
    },
    views: {
      card: {
        selectedFieldNames: [],
        join: [],
        count: [
          {
            fieldName: 'commentCount',
            countedCollectionName: 'comment',
            groupBy: 'commentedArticle',
          },
        ],
      },
    },
  },
  clap: {
    src: {
      clappedArticle: {
        type: 'refId',
        refCollection: 'article',
      },
    },
    views: {
      detail: {
        selectedFieldNames: [],
        join: [
          {
            firstRef: {
              collectionName: 'article',
              fieldName: 'clappedArticle',
            },
            refChain: [
              {
                collectionName: 'user',
                fieldName: 'ownerUser',
              },
            ],
            selectedFieldNames: ['bio'],
          },
        ],
        count: [],
      },
    },
  },
  comment: {
    src: {
      text: {
        type: 'string',
      },
      commentedArticle: {
        type: 'refId',
        refCollection: 'article',
      },
    },
    views: {},
  },
});
