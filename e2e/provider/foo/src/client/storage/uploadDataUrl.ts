import { taskEither } from 'fp-ts';
import { UploadParam } from 'masmott/type';

import { FooEnv } from '../env';
export const uploadDataUrl = (_env: FooEnv) => (_p: UploadParam) => taskEither.right(undefined);
