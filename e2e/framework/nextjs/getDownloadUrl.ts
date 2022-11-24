import { Option } from 'fp-ts/Option';
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

export const getDownloadUrl
: (
  _p: GetDownloadUrlParam
) => TaskEither<GetDownloadUrlError['Union'], ProviderValue<string, PC>> =
  process.env.NODE_ENV === 'production'
    ? providerStack.client.storage.getDownloadUrl({ browser: { window: () => window }, client: {} })
    : mockStack.client.storage.getDownloadUrl({ browser: { window: () => window }, client: {} });

// const a = providerStack.client.storage.getDownloadUrl({
//   browser: { window: () => window },
//   client: {},
// });
//
// const b = mockStack.client.storage.getDownloadUrl({
//   browser: { window: () => window },
//   client: {},
// });
//
// type A = typeof a;
// type B = typeof b;
//
// type Fn<T> = ReturnType<T> extends TaskEither<any, {providerContext: Option<infer R>}> ? R : never;
// type AA = Fn<A>;
// type BB = Fn<B>;
