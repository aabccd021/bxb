import { taskEither } from 'fp-ts';

import type { Stack } from '../../env';
type Type = Stack['client']['storage']['getDownloadUrl'];

export const getDownloadUrl: Type = (_env) => (_p) => taskEither.right('');
