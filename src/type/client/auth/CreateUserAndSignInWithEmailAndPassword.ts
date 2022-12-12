import type { TaskEither } from 'fp-ts/TaskEither';

import type { AuthUser, ProviderError } from '../../..';

export type Param = {
  readonly email: string;
  readonly password: string;
};

export type Error = ProviderError | { readonly code: 'EmailAlreadyInUse' };

export type Fn = (
  p: Param
) => TaskEither<
  Error & { readonly capability: 'client.auth.createUserAndSignInWithEmailAndPassword' },
  { readonly authUser: AuthUser }
>;
