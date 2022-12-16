import type { TaskEither } from 'fp-ts/TaskEither';

import type { DocKey } from '../..';
import type { DocData } from '../..';

export type Param = { readonly key: DocKey; readonly data: DocData };

export type Provider = { readonly code: 'Provider'; readonly value: unknown };

export type Forbidden = { readonly code: 'Forbidden' };

export type Error = Forbidden | Provider;

export type Fn = (
  p: Param
) => TaskEither<Error & { readonly capability: 'server.db.upsertDoc' }, undefined | void>;
