import { taskEither } from 'fp-ts';

import type { FooClient } from '../../env';

type Type = FooClient['auth']['createUserAndSignInWithEmailAndPassword'];

export const createUserAndSignInWithEmailAndPassword: Type = (_env) => (_param) =>
  taskEither.of(undefined);
