import { taskEither } from 'fp-ts';

import type { Stack } from '../../env';
type Type = Stack['client']['storage']['uploadDataUrlAwaitFunctions'];

export const uploadDataUrlAwaitFunctions: Type = (_env) => (_p) => taskEither.right(undefined);
