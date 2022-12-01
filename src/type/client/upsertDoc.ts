import type { TaskEither } from 'fp-ts/TaskEither';

import type { DocKey } from '../..';
import type { DocData } from '..';

export type Param = {
  readonly key: DocKey;
  readonly data: DocData;
};

export type Error = {
  readonly code: 'ProviderError';
  readonly value: unknown;
};

export type ForbiddenError = {
  readonly code: 'ForbiddenError';
};

export type Fn = (p: Param) => TaskEither<Error, void>;
