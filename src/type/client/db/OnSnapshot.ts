import type { Either } from 'fp-ts/Either';
import type { IO } from 'fp-ts/IO';
import type { Option } from 'fp-ts/Option';

import type { DocData, DocKey } from '../..';

export type ProviderError = {
  readonly code: 'ProviderError';
  readonly value: unknown;
};

export type ForbiddenError = {
  readonly code: 'ForbiddenError';
};

export type Error = ForbiddenError | ProviderError;

export type DocState = Either<Error, Option<DocData>>;

export type OnChangedCallback = (docState: DocState) => IO<undefined | void>;

export type Param = {
  readonly onChanged: OnChangedCallback;
  readonly key: DocKey;
};

export type Unsubscribe = IO<void>;

export type Fn = (p: Param) => IO<Unsubscribe>;
