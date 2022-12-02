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

type DocumentField = {
  readonly type: 'DocumentField';
  readonly fieldName: string;
};

type AuthUid = {
  readonly type: 'AuthUid';
};

type Commutative<T> = T extends readonly [infer A, infer B]
  ? readonly [A, B] | readonly [B, A]
  : never;

type Equal = {
  readonly type: 'Equal';
  readonly compare: Commutative<readonly [DocumentField, AuthUid]>;
};

export type Field = IntField | StringField;

export type Schema = Record<string, Field>;

export type CollectionConfig = {
  readonly schema: Schema;
  readonly securityRule?: {
    readonly get?: True;
    readonly create?: True | Equal;
  };
};

export type Param = Record<string, CollectionConfig>;

export type Fn = (c: Param) => TaskEither<{ readonly code: string }, unknown>;
