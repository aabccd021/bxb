import { option, taskEither } from 'fp-ts';

import type { FooClient } from '../env';
type Type = FooClient['db']['getDoc'];

export const getDoc: Type = (_env) => (_p) => taskEither.right(option.none);
