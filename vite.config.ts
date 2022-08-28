import path from 'path';
import { defineConfig } from 'vitest/config';

export const config = {
  test: {
    maxConcurrency: 1000,
    testTimeout: 10000,
    environment: 'happy-dom' as const,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'masmott',
    },
  },
};

export default defineConfig(config);
