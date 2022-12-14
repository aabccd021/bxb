import type { Either } from 'fp-ts/Either';
import type { Option } from 'fp-ts/Option';
import type { Task } from 'fp-ts/Task';

import type { DocData, DocKey } from '../..';

export type Provider = {
  readonly code: 'Provider';
  readonly value: unknown;
};

export type Forbidden = {
  readonly code: 'Forbidden';
};

export type Error = Forbidden | Provider;

export type DocState = Either<
  Error & { readonly capability: 'client.db.getDocWhen' },
  Option<DocData>
>;

export type Param<T> = {
  readonly key: DocKey;
  readonly select: (docState: DocState) => Option<T>;
};

export type Fn = <T>(p: Param<T>) => Task<T>;
