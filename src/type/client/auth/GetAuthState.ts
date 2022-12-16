import type { TaskEither } from 'fp-ts/TaskEither';

import type { AuthState } from '../..';

export type Fn = TaskEither<
  { readonly capability: 'client.auth.getAuthState' } & { readonly code: string },
  AuthState
>;
