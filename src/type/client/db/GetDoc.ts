import type { Option } from 'fp-ts/Option';
import type { TaskEither } from 'fp-ts/TaskEither';

import type { DocData, DocKey } from '../..';

export type Param = { readonly key: DocKey };

export type Provider = { readonly code: 'Provider'; readonly value: unknown };

export type Forbidden = { readonly code: 'Forbidden' };

export type Error = Forbidden | Provider;

export type Fn = (
  p: Param
) => TaskEither<Error & { readonly capability: 'client.db.getDoc' }, Option<DocData>>;
