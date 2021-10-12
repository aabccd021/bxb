import { _useDocCreation, _useViewable } from './_useDoc';
import { CollectionSpec, Dictionary } from './type';
import { Doc, DocCreation } from './types';

export type Collection = 'article' | 'user' | 'clap' | 'comment';

export type View = 'user_card' | 'user_detail' | 'article_card' | 'clap_detail';

export type Viewable = Collection | View;

export type DocKey<C extends Collection> = [C, string];

export type User = {
  uid: string;
  bio: string;
};

export type User_Card = {
  bio: string;
};

export type User_Detail = {
  articleCount: number;
};

export type Article = {
  text: string;
  ownerUser: string;
};

export type Article_Card = {
  commentCount: number;
};

export type Clap = {
  clappedArticle: string;
};

export type Clap_Detail = {
  clappedArticle_ownerUser_bio: string;
};

export type Comment = {
  text: string;
  commentedArticle: string;
};

export type CreateUser = {
  uid: string;
  bio: string;
};

export type CreateArticle = {
  text: string;
  ownerUser: string;
};

export type CreateClap = {
  clappedArticle: string;
};

export type CreateComment = {
  text: string;
  commentedArticle: string;
};

export type DataOfViewable<V extends Viewable> = V extends 'user'
  ? User
  : V extends 'user_card'
  ? User_Card
  : V extends 'user_detail'
  ? User_Detail
  : V extends 'article'
  ? Article
  : V extends 'article_card'
  ? Article_Card
  : V extends 'clap'
  ? Clap
  : V extends 'clap_detail'
  ? Clap_Detail
  : V extends 'comment'
  ? Comment
  : never;

export type CreateDataOfCollection<C extends Collection> = C extends 'user'
  ? CreateUser
  : C extends 'article'
  ? CreateArticle
  : C extends 'clap'
  ? CreateClap
  : C extends 'comment'
  ? CreateComment
  : never;

export const schema = {
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
): DocCreation<DataOfViewable<C>, CreateDataOfCollection<C>> {
  return _useDocCreation(
    collectionName,
    schema as Dictionary<CollectionSpec>
  ) as DocCreation<DataOfViewable<C>, CreateDataOfCollection<C>>;
}

export function useViewable<V extends Viewable>(
  viewableName: V,
  id: string
): Doc<DataOfViewable<V>> {
  return _useViewable(viewableName, id) as Doc<DataOfViewable<V>>;
}
