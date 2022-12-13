import type { TaskEither } from 'fp-ts/TaskEither';

import type { ProviderError } from '../..';

export type Param = {
  readonly key: string;
  readonly dataUrl: string;
};

export type Error =
  | ProviderError
  | { readonly code: 'Forbidden' }
  | { readonly code: 'InvalidDataUrlFormat' };

export type Fn = (
  p: Param
) => TaskEither<Error & { readonly capability: 'client.storage.uploadDataUrl' }, undefined | void>;
