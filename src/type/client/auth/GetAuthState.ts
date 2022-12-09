import type { TaskEither } from 'fp-ts/TaskEither';

import type { AuthState } from '../..';

export type Fn = TaskEither<
  {
    readonly code: string;
  } & { readonly capability: 'client.auth.getAuthState' },
  AuthState
>;
