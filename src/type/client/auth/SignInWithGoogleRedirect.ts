import type { TaskEither } from 'fp-ts/TaskEither';

import type { ProviderError } from '../../..';

export type Error = ProviderError;

export type Fn = TaskEither<
  Error & { readonly capability: 'client.auth.signInWithGoogleRedirect' },
  undefined | void
>;
