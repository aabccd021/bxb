import type { TaskEither } from 'fp-ts/TaskEither';

import type { AuthUser, Provider } from '../../..';

export type Param = {
  readonly email: string;
  readonly password: string;
};

export type Error = Provider | { readonly code: 'EmailAlreadyInUse' };

export type Fn = (
  p: Param
) => TaskEither<
  Error & { readonly capability: 'client.auth.createUserAndSignInWithEmailAndPassword' },
  { readonly authUser: AuthUser }
>;
