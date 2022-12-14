import type { Either } from 'fp-ts/Either';
import type { IO } from 'fp-ts/IO';
import type { Option } from 'fp-ts/Option';

import type { DocData, DocKey } from '../..';

export type Provider = {
  readonly code: 'Provider';
  readonly value: unknown;
};

export type Forbidden = {
  readonly code: 'Forbidden';
};

export type Error = Forbidden | Provider;

export type DocState = Either<Error, Option<DocData>>;

export type OnChangedCallback = (docState: DocState) => IO<undefined | void>;

export type Param = {
  readonly onChanged: OnChangedCallback;
  readonly key: DocKey;
};

export type Unsubscribe = IO<void>;

export type Fn = (p: Param) => IO<Unsubscribe>;
