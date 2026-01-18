import { expect, Locator, Page } from '@playwright/test';
import { BaseElement } from './base.element';

/**
 * Represents a loading spinner/throbber element
 * Used to synchronize on AJAX operations
 */
export class Loader extends BaseElement {

    private static readonly DEFAULT_ROOT_SELECTOR = '.spinner.active';

    constructor(page: Page, rootSelector: string = Loader.DEFAULT_ROOT_SELECTOR) {
        super(page, rootSelector);
    }

    /**
     * Wait for loading to complete by:
     * 1. Optionally waiting for the spinner to appear (if checkVisible is true)
     * 2. Waiting for the spinner to disappear
     * 
     * @param checkVisible - If true, first wait for spinner to be visible before waiting for it to hide
     * @param timeout - Maximum time to wait in milliseconds (default: 10000ms)
     */
    async waitForLoad(checkVisible: boolean = true, timeout: number = 10000): Promise<void> {
        if (checkVisible) {
            try {
                // Wait for spinner to appear first (with a shorter timeout)
                await expect(this.root, 'Loader should appear').toBeVisible({ timeout: 2000 });
            } catch (error) {
                // If spinner doesn't appear, it might have already disappeared
                // Continue to check if it's hidden
            }
        }
        
        // Wait for spinner to disappear
        await expect(this.root, 'Loader should disappear').toBeHidden({ timeout });
    }

    /**
     * Wait for the spinner to be visible
     */
    async waitForVisible(timeout: number = 5000): Promise<void> {
        await expect(this.root, 'Loader should be visible').toBeVisible({ timeout });
    }

    /**
     * Wait for the spinner to be hidden
     */
    async waitForHidden(timeout: number = 10000): Promise<void> {
        await expect(this.root, 'Loader should be hidden').toBeHidden({ timeout });
    }

    /**
     * Check if the spinner is currently visible
     */
    async isVisible(): Promise<boolean> {
        try {
            return await this.root.isVisible();
        } catch {
            return false;
        }
    }
}
