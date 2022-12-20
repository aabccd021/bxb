import type { Option } from 'fp-ts/Option';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';

import type * as Functions from './functions';
import type * as Stack from './stack';

export { Functions, Stack };

export type Provider = { readonly code: 'Provider'; readonly value: unknown };

export type DocKey = { readonly collection: string; readonly id: string };

export type AuthUser = { readonly uid: string };

export type AuthState = Option<AuthUser>;

export type DocData = ReadonlyRecord<string, unknown>;

export type ApplyClientEnvScope<ClientEnv, J extends ReadonlyRecord<string, unknown>> = {
  readonly [JJ in keyof J]: (env: ClientEnv) => J[JJ];
};

export type ApplyClientEnv<
  ClientEnv,
  K extends ReadonlyRecord<string, ReadonlyRecord<string, unknown>>
> = {
  readonly [KK in keyof K]: ApplyClientEnvScope<ClientEnv, K[KK]>;
};

export type StackType = {
  readonly env: { readonly client: unknown; readonly ci: unknown; readonly server: unknown };
};

export type StackWithEnv<T extends StackType = StackType> = {
  readonly ci: ApplyClientEnvScope<T['env']['ci'], Stack.ci.Type>;
  readonly client: ApplyClientEnv<T['env']['client'], Stack.client.Type>;
  readonly server: ApplyClientEnv<T['env']['server'], Stack.server.Type>;
};

export type DeployFunctionParam = { readonly functions: ReadonlyRecord<string, Functions.Type> };

export type FunctionsBuilder<S> = (server: S) => DeployFunctionParam;
