import { Client } from 'masmott/dist/es6/type';

import { FooEnv } from '../env';
type Type = Client['auth']['signInWithGoogleRedirect'];
export const signInWithGoogleRedirect =
  (_env: FooEnv): Type =>
  () =>
    undefined;
