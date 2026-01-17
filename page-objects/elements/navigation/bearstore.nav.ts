import { expect, Locator, Page } from '@playwright/test';
import { BaseElement } from '../base.element';

export class BearstoreNavigation extends BaseElement {
    private static readonly DEFAULT_ROOT_SELECTOR = '.dropdown-menu:visible';
    constructor(page: Page, rootSelector: string = BearstoreNavigation.DEFAULT_ROOT_SELECTOR) {
        super(page, rootSelector);
    }

    // Open navigation dropdown
    async openDropdown(navItem: Locator): Promise<void> {
        await navItem.hover();

        // Wait for dropdown to appear
        await expect(this.root.locator('.dropdown-menu:visible'), `dropdown menu should appear`).toBeVisible();
    }
}