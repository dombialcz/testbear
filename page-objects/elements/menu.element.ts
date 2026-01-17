import { expect, Locator, Page } from '@playwright/test';
import { BaseElement } from './base.element';

export class Menu extends BaseElement {

    private static readonly DEFAULT_ROOT_SELECTOR = '#header';

    constructor(page: Page, rootSelector: string = Menu.DEFAULT_ROOT_SELECTOR) {
        super(page, rootSelector);
    }

    // Menubar elements
    readonly currencySelector = this.root.locator('.currency-selector');
    readonly currencyButton = this.currencySelector.locator('a.menubar-link');
    readonly currencyDropdown = this.currencySelector.locator('.dropdown-menu');

    readonly contactUsLink = this.root.getByRole('link', { name: 'Contact us' });
    readonly serviceDropdown = this.root.locator('.cms-menu-dropdown[data-menu-name="helpandservice"]');
    readonly serviceButton = this.serviceDropdown.locator('a.menubar-link');
    readonly loginLink = this.root.locator('#menubar-my-account').getByRole('link', { name: 'Log in' });

    // Shopbar tools (mobile and desktop)
    readonly menuButton = this.root.locator('#shopbar-menu a.shopbar-button');
    readonly userButton = this.root.locator('#shopbar-user a.shopbar-button');
    readonly compareButton = this.root.locator('#shopbar-compare a.shopbar-button');
    readonly compareItemsCount = this.root.locator('#shopbar-compare [data-bind-to="CompareItemsCount"]');
    readonly wishlistButton = this.root.locator('#shopbar-wishlist a.shopbar-button');
    readonly wishlistItemsCount = this.root.locator('#shopbar-wishlist [data-bind-to="WishlistItemsCount"]');
    readonly cartButton = this.root.locator('#shopbar-cart a.shopbar-button');
    readonly cartItemsCount = this.root.locator('#shopbar-cart [data-bind-to="CartItemsCount"]');

    // Main navigation items
    readonly menuMain = this.root.locator('#menu-main');
    readonly booksNav = this.menuMain.getByRole('link', { name: MainMenuItem.BOOKS });
    readonly furnitureNav = this.menuMain.getByRole('link', { name: MainMenuItem.FURNITURE });
    readonly sportsNav = this.menuMain.getByRole('link', { name: MainMenuItem.SPORTS });
    readonly gamingNav = this.menuMain.getByRole('link', { name: MainMenuItem.GAMING });
    readonly watchesNav = this.menuMain.getByRole('link', { name: MainMenuItem.WATCHES });
    readonly giftCardsNav = this.menuMain.getByRole('link', { name: MainMenuItem.GIFT_CARDS });

    // Currency dropdown items
    getCurrencyOption(currency: string) {
        return this.currencyDropdown.locator(`a[title="${currency}"]`);
    }

    // Service dropdown items
    readonly whatsNewLink = this.root.locator('a[href="/newproducts"]');
    readonly recentlyViewedLink = this.root.locator('a[href="/recentlyviewedproducts"]');
    readonly compareProductsLink = this.root.locator('a[href="/compareproducts"]');
    readonly aboutUsLink = this.root.locator('a[href="/aboutus"]');
    readonly disclaimerLink = this.root.locator('a[href="/disclaimer"]');
    readonly shippingInfoLink = this.root.locator('a[href="/shippinginfo"]');
    readonly conditionsOfUseLink = this.root.locator('a[href="/conditionsofuse"]');

    // Helper methods
    getMainNavItem(item: MainMenuItem): Locator {
        return this.menuMain.getByRole('link', { name: item });
    }

    getSubmenuItem(text: string): Locator {
        return this.root.locator('.dropdown-menu:visible').getByRole('link', { name: text });
    }

    async clickSubmenuItem(mainMenuItem: MainMenuItem, submenuText: string): Promise<void> {
        const mainNav = this.getMainNavItem(mainMenuItem);
        await this.openDropdown(mainNav);
        await this.getSubmenuItem(submenuText).click();
    }

    // Open navigation dropdown
    async openDropdown(navItem: Locator): Promise<void> {
        await navItem.hover();

        // Wait for dropdown to appear
        await expect(this.root.locator('.dropdown-menu:visible'), `dropdown menu should appear`).toBeVisible();
    }
}

export enum MainMenuItem {
    BOOKS = 'Books',
    FURNITURE = 'Furniture',
    SPORTS = 'Sports',
    GAMING = 'Gaming',
    WATCHES = 'Watches',
    GIFT_CARDS = 'Gift Cards'
}