import type { TaskEither } from 'fp-ts/TaskEither';

type StringField = {
  readonly type: 'StringField';
};

type IntField = {
  readonly type: 'IntField';
};

type True = {
  readonly type: 'True';
};

export type CollectionConfig = {
  readonly schema: Record<string, IntField | StringField>;
  readonly securityRule?: {
    readonly get?: True;
    readonly create?: True;
  };
};

export type Config = Record<string, CollectionConfig>;

export type Fn = (c: Config) => TaskEither<{ readonly code: string }, unknown>;
