import { option, taskEither } from 'fp-ts';

import type { Stack } from '../../env';
type Type = Stack['server']['db']['getDoc'];

export const getDoc: Type = (_env) => (_p) => taskEither.right(option.none);
