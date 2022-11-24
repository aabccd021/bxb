import { taskEither } from 'fp-ts';
import { SetDocParam } from 'masmott/type';

import { FooEnv } from '../env';
export const setDoc = (_env: FooEnv) => (_p: SetDocParam) =>
  taskEither.right<unknown, unknown>(undefined);
