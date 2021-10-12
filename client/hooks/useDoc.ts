import { _useDoc, Doc } from './_useDoc';

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

// export function createDoc(
//   collectionName: Collection,
//   data: DocData
// ): Promise<string> {}
