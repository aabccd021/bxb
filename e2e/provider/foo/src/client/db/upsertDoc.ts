import { taskEither } from 'fp-ts';

import type { Stack } from '../../env';
type Type = Stack['client']['db']['upsertDoc'];
export const upsertDoc: Type = (_env) => (_p) => taskEither.right(undefined);
