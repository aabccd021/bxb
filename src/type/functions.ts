import type { TaskEither } from 'fp-ts/TaskEither';

import type { AuthUser } from '.';

export type OnAuthUserCreated = {
  readonly trigger: 'onAuthUserCreated';
  readonly handler: (p: {
    readonly authUser: AuthUser;
  }) => TaskEither<{ readonly code: string }, undefined | void>;
};

export type OnObjectCreated = {
  readonly trigger: 'onObjectCreated';
  readonly handler: (p: {
    readonly object: { readonly key: string };
  }) => TaskEither<{ readonly code: string }, undefined | void>;
};

export type Type = OnAuthUserCreated | OnObjectCreated;
