import { Option } from 'fp-ts/Option';
import { TaskEither } from 'fp-ts/TaskEither';
import { GetDownloadUrlError, GetDownloadUrlParam, ProviderValue } from 'masmott';
import { stack as mockStack } from 'masmott/dist/es6/browser';
import { stack as providerStack } from 'masmott-foo';

type Fnu = (...args: readonly any[]) => unknown;

type Fn<T extends Fnu> = ReturnType<T> extends TaskEither<
  any,
  { readonly providerContext: Option<infer R> }
>
  ? R
  : never;

type FFn<A extends Fnu, B extends Fnu> = Fn<A> | Fn<B>;

///
const a = providerStack.client.storage.getDownloadUrl({
  browser: { window: () => window },
  client: {},
});

const b = mockStack.client.storage.getDownloadUrl({
  browser: { window: () => window },
  client: {},
});

export const getDownloadUrl: (
  _p: GetDownloadUrlParam
) => TaskEither<GetDownloadUrlError['Union'], ProviderValue<string, FFn<typeof a, typeof b>>> =
  process.env.NODE_ENV === 'production' ? a : b;
