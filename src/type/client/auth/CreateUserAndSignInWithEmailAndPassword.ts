import type { TaskEither } from 'fp-ts/TaskEither';

import type { ProviderError } from '../../..';

export type Param = {
  readonly email: string;
  readonly password: string;
};

export type Error = ProviderError | { readonly code: 'EmailAlreadyInUse' };

export type Fn = (p: Param) => TaskEither<Error, undefined | void>;
