import type { TaskEither } from 'fp-ts/TaskEither';

import type { AuthUser } from '.';

export type OnAuthUserCreated = {
  readonly trigger: 'onAuthUserCreated';
  readonly handler: (p: {
    readonly authUser: AuthUser;
  }) => TaskEither<{ readonly code: string }, undefined | void>;
};

export type Type = OnAuthUserCreated;
