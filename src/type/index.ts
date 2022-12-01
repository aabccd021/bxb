import type {} from '@morphic-ts/summoners/lib/tagged-union';

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
};
