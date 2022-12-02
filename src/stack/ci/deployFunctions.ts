import { option, taskEither } from 'fp-ts';

import type { Stack } from '../type';

type Type = Stack['ci']['deployFunctions'];

export const deployFunctions: Type = (env) => (params) =>
  taskEither.fromIO(env.functions.write(option.some(params)));
