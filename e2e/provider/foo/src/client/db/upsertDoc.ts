import { taskEither } from 'fp-ts';

import type { FooClient } from '../../env';
type Type = FooClient['db']['upsertDoc'];
export const upsertDoc: Type = (_env) => (_p) => taskEither.right(undefined);
