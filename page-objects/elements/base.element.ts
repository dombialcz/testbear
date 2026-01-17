import { Locator, Page } from '@playwright/test';

export class BaseElement {
  readonly root: Locator;
  readonly page: Page;

  // overloads (types only)
  constructor(page: Page, rootSelector: string);
  constructor(locator: Locator);

  // single implementation
  constructor(
    pageOrLocator: Page | Locator,
    rootSelector?: string
  ) {
    if (pageOrLocator instanceof Object && 'locator' in pageOrLocator && !rootSelector) {
      // Locator passed directly
      this.root = pageOrLocator as Locator;
      this.page = this.root.page();
    } else {
      // Page + selector
      const page = pageOrLocator as Page;
      this.root = page.locator(rootSelector!);
      this.page = page;
    }
  }

  $(selector: string) {
    return this.root.locator(selector);
  }
}