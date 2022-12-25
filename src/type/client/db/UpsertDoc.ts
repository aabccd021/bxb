import type { TaskEither } from 'fp-ts/TaskEither';

import type { DocData, DocKey } from '../..';

export type Param = { readonly key: DocKey; readonly data: DocData };

export type Provider = { readonly code: 'Provider'; readonly value: unknown };

export type Forbidden = { readonly code: 'Forbidden' };

export type Error = Forbidden | Provider;

export type Fn = (
  p: Param
) => TaskEither<Error & { readonly capability: 'client.db.upsertDoc' }, undefined | void>;
