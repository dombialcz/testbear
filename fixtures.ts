import { test as baseTest } from '@playwright/test';
import { PageFixtures, pageFixtures } from './fixtures/page-fixtures';

// export const test = baseTest.extend<MockFixtures & PageFixtures>({
export const test = baseTest.extend<PageFixtures>({
  ...pageFixtures,
});
