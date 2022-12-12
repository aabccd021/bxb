import { taskEither } from 'fp-ts';

import type { Stack } from '../../env';

type Type = Stack['client']['auth']['createUserAndSignInWithEmailAndPassword'];

export const createUserAndSignInWithEmailAndPassword: Type = (_env) => (_param) =>
  taskEither.left({
    capability: 'client.auth.createUserAndSignInWithEmailAndPassword',
    code: 'ProviderError',
    value: '',
  });
