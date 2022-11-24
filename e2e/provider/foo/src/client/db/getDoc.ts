import { option, taskEither } from 'fp-ts';
import { GetDocParam, provider } from 'masmott/type';

import { FooEnv } from '../env';
export const getDoc = (_env: FooEnv) => (_p: GetDocParam) =>
  taskEither.right(provider.of(option.none));
