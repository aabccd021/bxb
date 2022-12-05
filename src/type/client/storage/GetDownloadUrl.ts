import type { TaskEither } from 'fp-ts/TaskEither';

import type { ProviderError } from '../db/UpsertDoc';

export type Param = {
  readonly key: string;
};

export type Error = ProviderError | { readonly code: 'FileNotFound' };

export type Fn = (p: Param) => TaskEither<Error, string>;
