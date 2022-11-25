import { taskEither } from 'fp-ts';

import type { FooClient } from '../env';
type Type = FooClient['db']['setDoc'];
export const setDoc: Type = (_env) => (_p) => taskEither.right(undefined);
