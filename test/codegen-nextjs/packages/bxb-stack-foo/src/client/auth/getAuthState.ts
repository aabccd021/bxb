import { taskEither } from 'fp-ts';

import type { Stack } from '../../env';

type Type = Stack['client']['auth']['getAuthState'];

export const getAuthState: Type = (_env) =>
  taskEither.left({ code: 'not implemented', capability: 'client.auth.getAuthState' });
