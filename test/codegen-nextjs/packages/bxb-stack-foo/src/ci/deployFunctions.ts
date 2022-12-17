import { taskEither } from 'fp-ts';

import type { Stack } from '../env';

type Type = Stack['ci']['deployFunctions'];
export const deployFunctions: Type = () => () => taskEither.of(undefined);
