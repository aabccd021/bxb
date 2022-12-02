import type { TaskEither } from 'fp-ts/TaskEither';

import type { AuthState } from '..';
import type { Type as Server } from '../server';

export type StringField = {
  readonly type: 'StringField';
};

export type IntField = {
  readonly type: 'IntField';
};

export type True = {
  readonly type: 'True';
};

export type DocumentField = {
  readonly type: 'DocumentField';
  readonly fieldName: string;
};

export type AuthUid = {
  readonly type: 'AuthUid';
};

type Commutative<T> = T extends readonly [infer A, infer B]
  ? readonly [A, B] | readonly [B, A]
  : never;

export type Comparable = Commutative<readonly [DocumentField, AuthUid]>;

export type Equal = {
  readonly type: 'Equal';
  readonly compare: Comparable;
};

export type Field = IntField | StringField;

export type Schema = Record<string, Field>;

export type CreateRule = Equal | True;

export type OnAuthCreatedFunction = {
  readonly trigger: 'onAuthCreated';
  readonly handler: (p: {
    readonly context: AuthState;
    readonly server: Server;
  }) => TaskEither<{ readonly code: string }, void>;
};

export type Functions = OnAuthCreatedFunction;

export type Param = Record<string, Functions>;

export type Fn = (c: Param) => TaskEither<{ readonly code: string }, unknown>;
