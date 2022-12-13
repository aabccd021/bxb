import { option, taskEither } from 'fp-ts';

import type { Stack } from '../type';

type Type = Stack['ci']['deployStorage'];

export const deployStorage: Type = (env) => (config) =>
  taskEither.fromIO(env.storageDeployConfig.write(option.some(config)));
