import { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export const withMasmott =
  (conf: NextConfig) =>
  (phase: string): NextConfig => ({
    ...conf,
    rewrites: async () => {
      const oldRewrites = await conf.rewrites?.();
      const newRewrites =
        phase === PHASE_DEVELOPMENT_SERVER
          ? [
              {
                source: '/__masmott__/signInWithRedirect',
                destination: '/masmott/signInWithRedirect.html',
              },
            ]
          : [];
      return oldRewrites === undefined
        ? newRewrites
        : Array.isArray(oldRewrites)
        ? [...oldRewrites, ...newRewrites]
        : {
            ...oldRewrites,
            beforeFiles: [...oldRewrites.beforeFiles, ...newRewrites],
          };
    },
  });
