import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:9002',
    trace: 'on-first-retry',
  },
  webServer: {
    command: isCI ? 'npm run start -- -p 9002' : 'npm run dev',
    url: 'http://localhost:9002',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
