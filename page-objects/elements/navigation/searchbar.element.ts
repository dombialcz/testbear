import { Page } from '@playwright/test';
import { BaseElement } from '../base.element';

export class Searchbar extends BaseElement {
    private static readonly DEFAULT_ROOT_SELECTOR = '.shopbar-search';

    constructor(page: Page, rootSelector: string = Searchbar.DEFAULT_ROOT_SELECTOR) {
        super(page, rootSelector);
    }

    readonly searchInput = this.root.locator('input.instasearch-term[name="q"]');
    readonly searchButton = this.root.locator('button.instasearch-button');
    readonly searchForm = this.root.locator('form.instasearch-form');
    readonly searchDropdown = this.root.locator('.instasearch-drop');
    readonly searchDropdownBody = this.searchDropdown.locator('.instasearch-drop-body');
}
