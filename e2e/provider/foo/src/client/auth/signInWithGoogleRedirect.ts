import { FooClient } from '../env';
type Type = FooClient['auth']['signInWithGoogleRedirect'];
export const signInWithGoogleRedirect: Type = (_env) => () => undefined;
