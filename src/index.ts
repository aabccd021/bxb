import type { Env } from './type';

export * from './stack';
export * from './type';

export const adaptClientEnv = <T, C>(providerEnv: T, config: C): Env<T, C> => ({
  browser: { getWindow: () => window },
  provider: providerEnv,
  config,
});
