import { taskEither } from 'fp-ts';

import type { Stack } from '../../env';
type Type = Stack['client']['auth']['signInWithGoogleRedirect'];
export const signInWithGoogleRedirect: Type = (_env) => taskEither.of(undefined);
