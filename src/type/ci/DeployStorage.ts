import type { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import type { TaskEither } from 'fp-ts/TaskEither';

export type True = {
  readonly type: 'True';
};

export type StringConstant = {
  readonly type: 'StringConstant';
  readonly value: string;
};

export type NumberContant = {
  readonly type: 'NumberConstant';
  readonly value: number;
};

export type ObjectSize = {
  readonly type: 'ObjectSize';
};

export type ObjectId = {
  readonly type: 'ObjectId';
};

export type Document = {
  readonly type: 'Document';
  readonly collection: StringConstant;
  readonly id: ObjectId;
};

export type DocumentField = {
  readonly type: 'DocumentField';
  readonly fieldName: StringConstant;
  readonly document: Document;
};

export type AuthUid = {
  readonly type: 'AuthUid';
};

type Commutative<T> = T extends { readonly lhs: infer A; readonly rhs: infer B }
  ? T | { readonly lhs: B; readonly rhs: A }
  : never;

export type Comparable = Commutative<
  | { readonly lhs: DocumentField; readonly rhs: AuthUid }
  | { readonly lhs: ObjectSize; readonly rhs: ObjectSize }
>;

export type Equal = {
  readonly type: 'Equal';
  readonly compare: Comparable;
};

export type CreateRule = ReadonlyNonEmptyArray<Equal | True>;

export type Param = {
  readonly securityRule?: {
    readonly get?: True;
    readonly create?: CreateRule;
  };
};

export type Fn = (
  p: Param
) => TaskEither<{ readonly capability: 'ci.DeployStorage' } & { readonly code: string }, unknown>;
