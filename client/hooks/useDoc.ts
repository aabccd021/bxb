import { _useDoc, _useDocCreation } from './_useDoc';
import { CollectionSpec, Dictionary } from './type';
import { Doc, DocCreation } from './types';

type Collection = 'article' | 'user' | 'clap' | 'comment';
type DocKey<C extends Collection> = [C, string];

type User = {
  uid: string;
  bio: string;
};

type Article = {
  text: string;
  ownerUser: string;
};

type Clap = {
  clappedArticle: string;
};

type Comment = {
  text: string;
  commentedArticle: string;
};

type CreateUser = {
  uid: string;
  bio: string;
};

type CreateArticle = {
  text: string;
  ownerUser: string;
};

type CreateClap = {
  clappedArticle: string;
};

type CreateComment = {
  text: string;
  commentedArticle: string;
};

type DataOfCollection<C extends Collection> = C extends 'user'
  ? User
  : C extends 'article'
  ? Article
  : C extends 'clap'
  ? Clap
  : C extends 'comment'
  ? Comment
  : never;

type CreateDataOfCollection<C extends Collection> = C extends 'user'
  ? CreateUser
  : C extends 'article'
  ? CreateArticle
  : C extends 'clap'
  ? CreateClap
  : C extends 'comment'
  ? CreateComment
  : never;

export function useDoc<C extends Collection>(
  key: DocKey<C>
): Doc<DataOfCollection<C>> {
  return _useDoc(key) as Doc<DataOfCollection<C>>;
}

const schema = {
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
        joinSpecs: [],
        countSpecs: [],
      },
      detail: {
        selectedFieldNames: [],
        joinSpecs: [],
        countSpecs: [
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
        joinSpecs: [],
        countSpecs: [
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
        joinSpecs: [
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
        countSpecs: [],
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
};

export function useDocCreation<C extends Collection>(
  collectionName: C
): DocCreation<DataOfCollection<C>, CreateDataOfCollection<C>> {
  return _useDocCreation(
    collectionName,
    schema as Dictionary<CollectionSpec>
  ) as DocCreation<DataOfCollection<C>, CreateDataOfCollection<C>>;
}
