import { option, taskEither } from 'fp-ts';

import type { Stack } from '../type';

type Type = Stack['ci']['deployDb'];

export const deployDb: Type = (env) => (config) =>
  taskEither.fromIO(env.dbDeployConfig.write(option.some(config)));
