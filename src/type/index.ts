import type { Option } from 'fp-ts/Option';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import type { TaskEither } from 'fp-ts/TaskEither';

import type * as Stack from './stack';

export { Stack };

export type ProviderError = {
  readonly code: 'ProviderError';
  readonly value: unknown;
};

export type DocKey = {
  readonly collection: string;
  readonly id: string;
};

export type AuthUser = {
  readonly uid: string;
};

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
  readonly env: {
    readonly client: unknown;
    readonly ci: unknown;
    readonly server: unknown;
  };
};

export type StackWithEnv<T extends StackType> = {
  readonly ci: ApplyClientEnvScope<T['env']['ci'], Stack.ci.Type>;
  readonly client: ApplyClientEnv<T['env']['client'], Stack.client.Type>;
  readonly server: ApplyClientEnv<T['env']['server'], Stack.server.Type>;
};

export type OnAuthCreatedFunction = {
  readonly trigger: 'onAuthCreated';
  readonly handler: (p: {
    readonly authUser: AuthUser;
  }) => TaskEither<{ readonly code: string }, undefined | void>;
};

export type Functions = OnAuthCreatedFunction;

export type DeployFunctionParam = {
  readonly functions: ReadonlyRecord<string, Functions>;
};

export type FunctionsBuilder = (server: Stack.server.Type) => DeployFunctionParam;
