// eslint-disable-next-line no-restricted-imports
import { initializeApp } from 'firebase-admin/app';
import { makeMasmottTriggers } from './get-trigger';

const app = initializeApp();

export const triggers = makeMasmottTriggers(app, {
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
        joinSpecs: {},
        countSpecs: {},
      },
      detail: {
        selectedFieldNames: [],
        joinSpecs: {},
        countSpecs: {
          articleCount: {
            countedCollectionName: 'article',
            groupBy: 'ownerUser',
          },
        },
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
        joinSpecs: {},
        countSpecs: {
          commentCount: {
            countedCollectionName: 'comment',
            groupBy: 'commentedArticle',
          },
        },
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
        joinSpecs: {
          clappedArticleOwner: {
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
        },
        countSpecs: {},
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
