import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    outputDiffLines: 10000,
    coverage: {
      enabled: true,
      exclude: ['src/test/stack/**', 'src/test/functions/**', 'test/**'],
    },
  },
});
