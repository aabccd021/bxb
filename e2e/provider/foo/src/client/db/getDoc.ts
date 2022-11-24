import { option, taskEither } from 'fp-ts';
import { Client } from 'masmott/dist/es6/type';

import { FooEnv } from '../env';
type Type = Client['db']['getDoc'];

export const getDoc =
  (_env: FooEnv): Type =>
  (_p) =>
    taskEither.right(option.none);
