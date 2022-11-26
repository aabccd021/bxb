import type { ClientContext } from './type';

export const mkClientContext = <Env, Config>(
  env: Env,
  config: Config
): ClientContext<{ readonly env: Env; readonly config: Config }> => ({
  browser: { getWindow: () => window },
  env,
  config,
});
