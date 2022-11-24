import { taskEither } from 'fp-ts';
import { Client } from 'masmott/dist/es6/type';

import { FooEnv } from '../env';
type Type = Client['db']['setDoc'];
export const setDoc =
  (_env: FooEnv): Type =>
  (_p) =>
    taskEither.right(undefined);
