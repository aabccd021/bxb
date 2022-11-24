import { taskEither } from 'fp-ts';
import { GetDownloadUrlParam, providerValue } from 'masmott/type';

import { FooEnv } from '../env';

export const getDownloadUrl = (_env: FooEnv) => (_p: GetDownloadUrlParam) =>
  taskEither.right(providerValue.of(''));
