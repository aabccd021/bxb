import { taskEither } from 'fp-ts';

import { FooClient } from '../env';
type Type = FooClient['storage']['uploadDataUrl'];

export const uploadDataUrl: Type = (_env) => (_p) => taskEither.right(undefined);
