import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',

  // Run all tests in parallel.
  fullyParallel: false,

  // Reporter to use
  reporter: 'html',

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test.
    trace: 'retain-on-failure',

    screenshot: 'only-on-failure',
  
    video: 'retain-on-failure',
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  workers: 2
  /*
  // Run your local dev server before starting the tests.
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  */
});