import type { Option } from 'fp-ts/Option';
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

export type DocData = Record<string, unknown>;

export type ApplyClientEnvScope<ClientEnv, J extends Record<string, unknown>> = {
  readonly [JJ in keyof J]: (env: ClientEnv) => J[JJ];
};

export type ApplyClientEnv<ClientEnv, K extends Record<string, Record<string, unknown>>> = {
  readonly [KK in keyof K]: ApplyClientEnvScope<ClientEnv, K[KK]>;
};

export type StackWithEnv<ClientEnv> = {
  readonly ci: ApplyClientEnvScope<ClientEnv, Stack.ci.Type>;
  readonly client: ApplyClientEnv<ClientEnv, Stack.client.Type>;
  readonly server: ApplyClientEnv<ClientEnv, Stack.server.Type>;
};

export type OnAuthCreatedFunction = {
  readonly trigger: 'onAuthCreated';
  readonly handler: (p: {
    readonly authUser: AuthUser;
  }) => TaskEither<{ readonly code: string }, undefined | void>;
};

export type Functions = OnAuthCreatedFunction;

export type DeployFunctionParam = {
  readonly functions: Record<string, Functions>;
};
