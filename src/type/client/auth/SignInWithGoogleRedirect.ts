import type { TaskEither } from 'fp-ts/TaskEither';

import type { Provider } from '../..';

export type Error = Provider;

export type Fn = TaskEither<
  Error & { readonly capability: 'client.auth.signInWithGoogleRedirect' },
  undefined | void
>;
