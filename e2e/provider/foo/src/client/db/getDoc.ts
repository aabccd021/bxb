import { option, taskEither } from 'fp-ts';
import { GetDocParam, providerValue } from 'masmott/type';

import { FooEnv } from '../env';
export const getDoc = (_env: FooEnv) => (_p: GetDocParam) =>
  taskEither.right(providerValue.of(option.none));