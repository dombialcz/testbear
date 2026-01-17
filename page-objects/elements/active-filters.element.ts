import { expect, Locator, Page } from '@playwright/test';
import { BaseElement } from './base.element';

/**
 * Represents the active filters display with ability to remove individual filters
 */
export class ActiveFilters extends BaseElement {

    private static readonly DEFAULT_ROOT_SELECTOR = '.active-filters-container';

    constructor(page: Page, rootSelector: string = ActiveFilters.DEFAULT_ROOT_SELECTOR) {
        super(page, rootSelector);
    }

    // Filter elements
    readonly filtersList = this.root.locator('ul.active-filters');
    readonly filterItems = this.filtersList.locator('li.active-filter-item:not(.active-filter-item-clear)');
    readonly removeAllFiltersButton = this.filtersList.locator('.active-filter-item-clear a');

    // Helper methods
    async getActiveFilterCount(): Promise<number> {
        return await this.filterItems.count();
    }

    async getActiveFilterLabels(): Promise<string[]> {
        const items = await this.filterItems.all();
        const labels: string[] = [];
        
        for (const item of items) {
            const label = await item.locator('.active-filter-label').textContent();
            if (label) {
                labels.push(label.trim());
            }
        }
        
        return labels;
    }

    async hasActiveFilters(): Promise<boolean> {
        return (await this.getActiveFilterCount()) > 0;
    }

    async removeAllFilters(): Promise<void> {
        await this.removeAllFiltersButton.click();
        
        // Wait for all filters to be removed
        await expect(this.filterItems, 'All filters should be removed').toHaveCount(0);
    }

    async assertFilterIsActive(filterLabel: string, message?: string): Promise<void> {
        const labels = await this.getActiveFilterLabels();
        expect(labels, message || `Expected filter "${filterLabel}" to be active`).toContain(filterLabel);
    }

    async assertNoActiveFilters(message?: string): Promise<void> {
        const count = await this.getActiveFilterCount();
        expect(count, message || 'Expected no active filters').toBe(0);
    }

    async assertActiveFilterCount(expectedCount: number, message?: string): Promise<void> {
        const count = await this.getActiveFilterCount();
        expect(count, message || `Expected ${expectedCount} active filters`).toBe(expectedCount);
    }

    async isVisible(): Promise<boolean> {
        return await this.root.isVisible();
    }
}
