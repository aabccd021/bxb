import { taskEither } from 'fp-ts';

import type { Stack } from '../env';

type Type = Stack['ci']['deployDb'];

export const deployDb: Type = () => () => taskEither.of(undefined);
