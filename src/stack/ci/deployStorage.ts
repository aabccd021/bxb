import { taskEither } from 'fp-ts';

import type { Stack } from '../type';

type Type = Stack['ci']['deployStorage'];

export const deployStorage: Type = () => () => taskEither.of(undefined);
