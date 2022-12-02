import { taskEither } from 'fp-ts';

import type { Stack } from '../../type';

type Type = Stack['client']['auth']['getAuthState'];

export const getAuthState: Type = () => taskEither.left({ code: 'not implemented' });
