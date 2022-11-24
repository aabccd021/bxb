import { taskEither } from 'fp-ts';
import { Client } from 'masmott/dist/es6/type';

import { FooEnv } from '../env';
type Type = Client['storage']['getDownloadUrl'];

export const getDownloadUrl =
  (_env: FooEnv): Type =>
  (_p) =>
    taskEither.right('');
