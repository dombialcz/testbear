import { Locator, Page } from '@playwright/test';

export class BaseElement {
  readonly root: Locator;

  constructor(
    readonly page: Page,
    readonly rootSelector: string,
  ) {
    this.root = this.page.locator(rootSelector); 
  }

  $(selector: string) {
    return this.root.locator(selector);
  }
}