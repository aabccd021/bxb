import { CreateUserAndSignInWithEmailAndPasswordParam } from 'masmott/type';

import { FooEnv } from '../env';

export const createUserAndSignInWithEmailAndPassword =
  (_env: FooEnv) => (_param: CreateUserAndSignInWithEmailAndPasswordParam) => () =>
    undefined;
