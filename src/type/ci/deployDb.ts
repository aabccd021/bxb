import type { TaskEither } from 'fp-ts/TaskEither';

type StringField = {
  readonly type: 'StringField';
};

// type False = {
//   readonly type: 'False';
// };

type True = {
  readonly type: 'True';
};

export type CollectionConfig = {
  readonly schema: Record<string, StringField>;
  readonly securityRule?: {
    readonly get?: True;
    readonly create?: True;
  };
};

export type Config = Record<string, CollectionConfig>;

export type Fn = (c: Config) => TaskEither<{ readonly code: string }, unknown>;
