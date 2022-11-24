import { taskEither } from 'fp-ts';
import { Client } from 'masmott/dist/es6/type';

import { FooEnv } from '../env';
type Type = Client['storage']['uploadDataUrl'];

export const uploadDataUrl =
  (_env: FooEnv): Type =>
  (_p) =>
    taskEither.right(undefined);
