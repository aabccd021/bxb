/* eslint-disable fp-ts/no-lib-imports */
import { option, taskEither } from 'fp-ts';
import { Option } from 'fp-ts/lib/Option';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { GetDownloadUrlError, GetDownloadUrlParam } from 'masmott/type';

import { FooEnv } from '../env';

export const getDownloadUrl =
  (_env: FooEnv) =>
  (
    _p: GetDownloadUrlParam
  ): TaskEither<
    GetDownloadUrlError['Union'],
    {
      readonly value: string;
      readonly providerContext: Option<{
        readonly provider: 'foo';
        readonly context: { readonly bar: string };
      }>;
    }
  > =>
    taskEither.right({
      value: 'zzz',
      providerContext: option.some({ provider: 'foo', context: { bar: 'baz' } }),
    });
