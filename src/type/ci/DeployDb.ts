import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import type { TaskEither } from 'fp-ts/TaskEither';

export type StringField = { readonly type: 'StringField' };

export type IntField = { readonly type: 'IntField' };

export type True = { readonly type: 'True' };

export type DocumentField = { readonly type: 'DocumentField'; readonly fieldName: string };

export type AuthUid = { readonly type: 'AuthUid' };

type Commutative<T> = T extends readonly [infer A, infer B]
  ? readonly [A, B] | readonly [B, A]
  : never;

export type Comparable = Commutative<readonly [DocumentField, AuthUid]>;

export type Equal = { readonly type: 'Equal'; readonly compare: Comparable };

export type Field = IntField | StringField;

export type Schema = ReadonlyRecord<string, Field>;

export type CreateRule = Equal | True;

export type UpdateRule = True;

export type CollectionConfig = {
  readonly schema: Schema;
  readonly securityRule?: {
    readonly get?: True;
    readonly create?: CreateRule;
    readonly update?: UpdateRule;
  };
};

export type Param = {
  readonly type: 'deploy';
  readonly collections: ReadonlyRecord<string, CollectionConfig>;
};

export type Fn = (
  c: Param
) => TaskEither<{ readonly capability: 'ci.DeployDb' } & { readonly code: string }, unknown>;
