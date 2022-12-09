import type { TaskEither } from 'fp-ts/TaskEither';

import type { DocKey } from '../..';
import type { DocData } from '../..';

export type Param = {
  readonly key: DocKey;
  readonly data: DocData;
};

export type ProviderError = {
  readonly code: 'ProviderError';
  readonly value: unknown;
};

export type ForbiddenError = {
  readonly code: 'ForbiddenError';
};

export type Error = ForbiddenError | ProviderError;

export type Fn = (
  p: Param
) => TaskEither<Error & { readonly capability: 'server.db.upsertDoc' }, undefined | void>;
