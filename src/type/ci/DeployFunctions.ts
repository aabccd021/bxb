import type { TaskEither } from 'fp-ts/TaskEither';

import type { AuthUser } from '..';

export type OnAuthCreatedFunction = {
  readonly trigger: 'onAuthCreated';
  readonly handler: (p: {
    readonly authUser: AuthUser;
  }) => TaskEither<{ readonly code: string }, undefined | void>;
};

export type Functions = OnAuthCreatedFunction;

export type Param = {
  readonly functions: Record<string, Functions>;
};

export type Fn = (c: Param) => TaskEither<{ readonly code: string }, unknown>;
