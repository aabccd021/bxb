import { OnAuthStateChangedParam } from 'masmott/type';

import { FooEnv } from '../env';

export const onAuthStateChanged = (_env: FooEnv) => (_p: OnAuthStateChangedParam) => () => () =>
  undefined;
