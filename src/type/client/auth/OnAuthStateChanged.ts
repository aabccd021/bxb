import type { IO } from 'fp-ts/IO';
import type { Option } from 'fp-ts/Option';

export type Param = (user: Option<string>) => IO<void>;

export type Unsubscribe = IO<void>;

export type Fn = (p: Param) => IO<Unsubscribe>;
