import { defineConfig, devices } from '@playwright/test';
import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { AccessibilityScanner } from './utils/accessibility-scanner';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',
    baseURL: 'https://bearstore-testsite.smartbear.com/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});


// !-- Extensions -- //

expect.extend({
  /**
   * Ensures the page is accessible according to configuration.
   *
   * If result of scanning have violations details of the violations will be attached to general report.
   *
   * ```js
   * await expect(page).toBeAccessible(testInfo);
   * await expect(page).toBeAccessible(testInfo, 'html_tag');
   * await expect(page).toBeAccessible(testInfo, 'css_selector');
   * await expect(page).toBeAccessible(testInfo, locator);
   * ```
   *
   * @param page Page provides methods to interact with a single tab.
   * @param testInfo TestInfo contains information about the currently running test.
   * @param include Playwright type Locator or string as CSS selector of page part for including to scanning. If not put it will be used selector from configuration.
   */
  async toBeAccessible(page: Page, testInfo: TestInfo, include: Locator | string = '.bb-page-layout__content') {
    const a11yScanner = new AccessibilityScanner(page);
    await a11yScanner.scanPage(include);

    if (a11yScanner.scanResults.violations.length === 0) {
      return {
        message: () => 'pass',
        pass: true,
      };
    } else {
      await a11yScanner.highlightViolations();

      await testInfo.attach('accessibility-scan-results', {
        body: JSON.stringify(a11yScanner.generateViolationsReport(), null, 2),
        contentType: 'application/json',
      });
      return {
        message: () => a11yScanner.generateShortReport(),
        pass: false,
      };
    }
  }
});
