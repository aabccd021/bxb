import { Client } from 'masmott/dist/es6/type';

import { FooEnv } from '../env';

type Type = Client['auth']['createUserAndSignInWithEmailAndPassword'];

export const createUserAndSignInWithEmailAndPassword =
  (_env: FooEnv): Type =>
  (_param) =>
  () =>
    undefined;
