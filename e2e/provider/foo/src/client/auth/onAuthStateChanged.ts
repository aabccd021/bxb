import { Client } from 'masmott/dist/es6/type';

import { FooEnv } from '../env';

type Type = Client['auth']['onAuthStateChanged'];

export const onAuthStateChanged =
  (_env: FooEnv): Type =>
  (_p) =>
  () =>
  () =>
    undefined;
