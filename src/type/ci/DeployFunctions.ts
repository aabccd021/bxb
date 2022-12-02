import type { TaskEither } from 'fp-ts/TaskEither';

import type { AuthUser } from '..';
import type { Type as Server } from '../server';

export type OnAuthCreatedFunction = {
  readonly trigger: 'onAuthCreated';
  readonly handler: (p: {
    readonly authUser: AuthUser;
    readonly server: Server;
  }) => TaskEither<{ readonly code: string }, void>;
};

export type Functions = OnAuthCreatedFunction;

export type Param = {
  readonly functions: Record<string, Functions>;
};

export type Fn = (c: Param) => TaskEither<{ readonly code: string }, unknown>;
