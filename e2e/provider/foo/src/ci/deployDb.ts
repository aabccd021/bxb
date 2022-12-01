import { taskEither } from 'fp-ts';

import type { FooCI } from '../env';

type Type = FooCI['deployDb'];

export const deployDb: Type = () => () => taskEither.of(undefined);
