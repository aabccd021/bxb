import type { IO } from 'fp-ts/IO';

import type { AuthState } from '../..';

export type Param = (authState: AuthState) => IO<void>;

export type Unsubscribe = IO<void>;

export type Fn = (p: Param) => IO<Unsubscribe>;
