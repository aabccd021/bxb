import { CollectionSpec, Dictionary } from "./type";
import { Doc, DocCreation } from "./types";
import { _useDocCreation, _useViewable } from "./_useDoc";

export type Collection = "article" | "user" | "clap" | "comment";

export type View =
  | readonly ["user", "card"]
  | readonly ["user", "detail"]
  | readonly ["article", "card"]
  | readonly ["clap", "detail"];

export type Viewable = readonly [Collection] | View;

export type DocKey<C extends Collection> = readonly [C, string];

export type User = {
  readonly uid: string;
  readonly bio: string;
};

export type User_Card = {
  readonly bio: string;
};

export type User_Detail = {
  readonly articleCount: number;
};

export type Article = {
  readonly text: string;
  readonly ownerUser: string;
};

export type Article_Card = {
  readonly commentCount: number;
};

export type Clap = {
  readonly clappedArticle: string;
};

export type Clap_Detail = {
  readonly clappedArticle_ownerUser_bio: string;
};

export type Comment = {
  readonly text: string;
  readonly commentedArticle: string;
};

export type CreateUser = {
  readonly uid: string;
  readonly bio: string;
};

export type CreateArticle = {
  readonly text: string;
  readonly ownerUser: string;
};

export type CreateClap = {
  readonly clappedArticle: string;
};

export type CreateComment = {
  readonly text: string;
  readonly commentedArticle: string;
};

export type DataOfViewable<
  C extends Collection,
  V extends ViewOf<C> | undefined
> = C extends "user"
  ? V extends { readonly view: "card" }
    ? User_Card
    : V extends { readonly view: "detail" }
    ? User_Detail
    : User
  : C extends "article"
  ? V extends { readonly view: "card" }
    ? Article_Card
    : Article
  : C extends "clap"
  ? V extends { readonly view: "clap_detail" }
    ? Clap_Detail
    : Clap
  : C extends "comment"
  ? Comment
  : never;

export type CreateDataOfCollection<C extends Collection> = C extends "user"
  ? CreateUser
  : C extends "article"
  ? CreateArticle
  : C extends "clap"
  ? CreateClap
  : C extends "comment"
  ? CreateComment
  : never;

export const schema = {
  user: {
    src: {
      uid: {
        type: "string",
      },
      bio: {
        type: "string",
      },
    },
    views: {
      card: {
        selectedFieldNames: ["bio"],
        joinSpecs: [],
        countSpecs: [],
      },
      detail: {
        selectedFieldNames: [],
        joinSpecs: [],
        countSpecs: [
          {
            fieldName: "articleCount",
            countedCollectionName: "article",
            groupBy: "ownerUser",
          },
        ],
      },
    },
  },
  article: {
    src: {
      text: {
        type: "string",
      },
      ownerUser: {
        type: "refId",
        refCollection: "user",
      },
    },
    views: {
      card: {
        selectedFieldNames: [],
        joinSpecs: [],
        countSpecs: [
          {
            fieldName: "commentCount",
            countedCollectionName: "comment",
            groupBy: "commentedArticle",
          },
        ],
      },
    },
  },
  clap: {
    src: {
      clappedArticle: {
        type: "refId",
        refCollection: "article",
      },
    },
    views: {
      detail: {
        selectedFieldNames: [],
        joinSpecs: [
          {
            firstRef: {
              collectionName: "article",
              fieldName: "clappedArticle",
            },
            refChain: [
              {
                collectionName: "user",
                fieldName: "ownerUser",
              },
            ],
            selectedFieldNames: ["bio"],
          },
        ],
        countSpecs: [],
      },
    },
  },
  comment: {
    src: {
      text: {
        type: "string",
      },
      commentedArticle: {
        type: "refId",
        refCollection: "article",
      },
    },
    views: {},
  },
};

export function useDocCreation<C extends Collection>(
  collectionName: C
): DocCreation<DataOfViewable<C, undefined>, CreateDataOfCollection<C>> {
  return _useDocCreation(
    collectionName,
    schema as Dictionary<CollectionSpec>
  ) as DocCreation<DataOfViewable<C, undefined>, CreateDataOfCollection<C>>;
}

export type ViewOf<C extends Collection> = C extends "user"
  ? { readonly view: "card" | "detail" }
  : C extends "article"
  ? { readonly view: "card" }
  : C extends "clap"
  ? { readonly view: "detail" }
  : C extends "comment"
  ? never
  : never;

export function useViewable<C extends Collection, V extends ViewOf<C>>(
  docKey: DocKey<C>,
  option?: V
): Doc<DataOfViewable<C, V extends ViewOf<C> ? V : undefined>> {
  return _useViewable(docKey, option?.view) as Doc<
    DataOfViewable<C, V extends ViewOf<C> ? V : undefined>
  >;
}

// const userCard: Doc<User_Card> = useViewable(['user', 'xxx'], { view: 'card' });
// const userDetail: Doc<User_Detail> = useViewable(['user', 'xxx'], {
//   view: 'detail',
// });
// const user: Doc<User> = useViewable(['user', 'xxx']);

// const userCreation = useDocCreation('article');
