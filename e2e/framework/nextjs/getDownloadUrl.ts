import { TaskEither } from 'fp-ts/TaskEither';
import { GetDownloadUrlError, GetDownloadUrlParam, ProviderValue } from 'masmott';
import { stack as mockStack } from 'masmott/dist/es6/browser';
import { stack as providerStack } from 'masmott-foo';

type PCMock = {
  readonly provider: 'mock';
  readonly context: {
    readonly aab: string;
  };
};

type PCFoo = {
  readonly provider: 'foo';
  readonly context: {
    readonly bar: string;
  };
};

type PC = PCMock | PCFoo;

export const getDownloadUrl = (
  process.env.NODE_ENV === 'production'
    ? providerStack.client.storage.getDownloadUrl({ browser: { window: () => window }, client: {} })
    : mockStack.client.storage.getDownloadUrl({ browser: { window: () => window }, client: {} })
) as (
  _p: GetDownloadUrlParam
) => TaskEither<GetDownloadUrlError['Union'], ProviderValue<string, PC>>;
