import type { Either } from 'fp-ts/Either';
import type { Option } from 'fp-ts/Option';
import type { Task } from 'fp-ts/Task';

import type { DocData, DocKey } from '../..';

export type ProviderError = {
  readonly code: 'ProviderError';
  readonly value: unknown;
};

export type ForbiddenError = {
  readonly code: 'ForbiddenError';
};

export type Error = ForbiddenError | ProviderError;

export type DocState = Either<
  Error & { readonly capability: 'client.db.getDocWhen' },
  Option<DocData>
>;

export type Param<T> = {
  readonly key: DocKey;
  readonly select: (docState: DocState) => Option<T>;
};

export type Fn = <T>(p: Param<T>) => Task<T>;
