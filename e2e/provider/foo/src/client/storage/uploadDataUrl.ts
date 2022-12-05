import { taskEither } from 'fp-ts';

import type { Stack } from '../../env';
type Type = Stack['client']['storage']['uploadDataUrl'];

export const uploadDataUrl: Type = (_env) => (_p) => taskEither.right(undefined);
