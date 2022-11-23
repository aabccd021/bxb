import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? '100%' : undefined,
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
  ],
  webServer: {
    command: 'pnpm dev',
    port: 3000,
  },
};

export default config;
