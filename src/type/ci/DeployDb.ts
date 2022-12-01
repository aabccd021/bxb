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

export type Field = IntField | StringField;

export type Schema = Record<string, Field>;

export type CollectionConfig = {
  readonly schema: Schema;
  readonly securityRule?: {
    readonly get?: True;
    readonly create?: True;
  };
};

export type Param = Record<string, CollectionConfig>;

export type Fn = (c: Param) => TaskEither<{ readonly code: string }, unknown>;
