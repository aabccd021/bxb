import { taskEither } from 'fp-ts';

import type { FooCI } from '../env';

type Type = FooCI['deployStorage'];
export const deployStorage: Type = () => () => taskEither.of(undefined);
