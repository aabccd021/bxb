import { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const rewrites = (phase: string) =>
  phase === PHASE_DEVELOPMENT_SERVER
    ? [
        {
          source: '/__masmott__/signInWithRedirect',
          destination: '/masmott/signInWithRedirect.html',
        },
      ]
    : [];

export const withMasmott =
  (conf: NextConfig) =>
  (phase: string): NextConfig => ({
    ...conf,
    rewrites: async () => {
      const rew = await conf.rewrites?.();
      const rews = rewrites(phase);
      return rew === undefined
        ? rews
        : Array.isArray(rew)
        ? [...rew, ...rews]
        : {
            ...rew,
            beforeFiles: [...rew.beforeFiles, ...rews],
          };
    },
  });
