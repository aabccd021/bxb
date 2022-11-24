/* eslint-disable fp-ts/no-lib-imports */
import { taskEither } from 'fp-ts';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { ProviderContext, UploadDataUrlError, UploadParam } from 'masmott/type';

import { FooEnv } from '../env';

export const uploadDataUrl =
  (_env: FooEnv) =>
  (_p: UploadParam): TaskEither<UploadDataUrlError['Union'], ProviderContext | undefined> =>
    taskEither.right(undefined);
