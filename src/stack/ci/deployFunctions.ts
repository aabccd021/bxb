import { taskEither } from 'fp-ts';

import type { Stack } from '../type';

type Type = Stack['ci']['deployFunctions'];

export const deployFunctions: Type = (_env) => (_config) => taskEither.right('');
