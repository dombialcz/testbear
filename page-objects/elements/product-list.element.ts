import { expect, Locator, Page } from '@playwright/test';
import { BaseElement } from './base.element';

/**
 * Represents the main product listing container on category pages
 */
export class ProductList extends BaseElement {

    private static readonly DEFAULT_ROOT_SELECTOR = '.product-list-container';

    constructor(page: Page, rootSelector: string = ProductList.DEFAULT_ROOT_SELECTOR) {
        super(page, rootSelector);
    }

    // Count and pagination
    readonly itemCountElement = this.root.locator('.search-hitcount');
    readonly productGrid = this.root.locator('.artlist');
    readonly productArticles = this.productGrid.locator('article.art');

    // Sort dropdown
    readonly sortDropdown = this.root.locator('#artlist-action-sort');
    readonly sortButton = this.root.locator('.artlist-action--sort button');

    // Page size dropdown
    readonly pageSizeDropdown = this.root.locator('#artlist-action-pagesize');
    readonly pageSizeButton = this.root.locator('.artlist-action--pagesize button');

    // View mode
    readonly listViewButton = this.root.locator('.artlist-action--viewmode a[href*="v=list"]');

    // Helper methods
    async getNthProduct(n: number): Promise<Product> {
        const productElement = this.productArticles.nth(n);
        return new Product(productElement);
    }

    async getItemCount(): Promise<{ displayed: number; total: number }> {
        const countText = await this.itemCountElement.textContent();
        if (!countText) {
            throw new Error('Item count element not found');
        }
        
        // Parse "1-4 of 4" format
        const match = countText.match(/(\d+)-(\d+)\s+of\s+(\d+)/);
        if (!match) {
            throw new Error(`Unable to parse item count: ${countText}`);
        }

        return {
            displayed: parseInt(match[2], 10) - parseInt(match[1], 10) + 1,
            total: parseInt(match[3], 10)
        };
    }

    async assertItemCount(expectedTotal: number, message?: string): Promise<void> {
        const count = await this.getItemCount();
        await expect(count.total, message || `Expected ${expectedTotal} items`).toBe(expectedTotal);
    }

    getProductByName(productName: string): Product {
        const productElement = this.productArticles.filter({
            has: this.page.locator('.art-name').filter({ hasText: productName })
        });
        return new Product(productElement);
    }

    async sortBy(sortOption: SortOption): Promise<void> {
        await this.sortDropdown.selectOption({ label: sortOption });
    }

    async setPageSize(size: PageSize): Promise<void> {
        await this.pageSizeDropdown.selectOption({ value: size.toString() });
    }

    async switchToListView(): Promise<void> {
        await this.listViewButton.click();
    }
}

/**
 * Represents a single product card in the product listing
 */
export class Product extends BaseElement {

    constructor(productLocator: Locator) {
        super(productLocator);
    }

    // Product elements
    readonly productName = this.root.locator('.art-name a span');
    readonly productLink = this.root.locator('.art-name a');
    readonly productImage = this.root.locator('.art-picture img');
    readonly productBrand = this.root.locator('.art-brand span');
    readonly productDescription = this.root.locator('.art-description');
    
    // Price elements
    readonly currentPrice = this.root.locator('.art-price');
    readonly oldPrice = this.root.locator('.art-oldprice');
    readonly discountBadge = this.root.locator('.art-badges .badge-danger');
    
    // Delivery info
    readonly deliveryTime = this.root.locator('.delivery-time span[dir="auto"]');
    
    // Action buttons
    readonly addToCartButton = this.root.locator('[data-type="cart"]');
    readonly addToWishlistButton = this.root.locator('[data-type="wishlist"]');
    readonly addToCompareButton = this.root.locator('[data-type="compare"]');
    readonly viewDetailsButton = this.root.locator('.art-btn-group a[href]:not([data-type])').last();

    // Helper methods
    async select(): Promise<void> {
        await this.root.hover();
    }

    async getName(): Promise<string> {
        return (await this.productName.textContent()) || '';
    }

    async getPrice(): Promise<string> {
        const priceText = await this.currentPrice.textContent();
        if (!priceText) {
            throw new Error('Price not found');
        }
        return priceText.trim();
    }

    async getPriceValue(): Promise<number> {
        const priceText = await this.getPrice();
        // Extract numeric value from formats like "$29.99 excl tax" or "From $20.90 excl tax"
        const match = priceText.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse price: ${priceText}`);
        }
        return parseFloat(match[1]);
    }

    async getOldPrice(): Promise<string | null> {
        const isVisible = await this.oldPrice.isVisible();
        if (!isVisible) {
            return null;
        }
        return (await this.oldPrice.textContent())?.trim() || null;
    }

    async getDiscount(): Promise<string | null> {
        const isVisible = await this.discountBadge.isVisible();
        if (!isVisible) {
            return null;
        }
        return (await this.discountBadge.textContent())?.trim() || null;
    }

    async hasDiscount(): Promise<boolean> {
        return await this.discountBadge.isVisible();
    }

    async getBrand(): Promise<string | null> {
        const brandText = await this.productBrand.textContent();
        return brandText?.trim() || null;
    }

    async getDescription(): Promise<string> {
        return (await this.productDescription.textContent())?.trim() || '';
    }

    async getDeliveryTime(): Promise<string> {
        return (await this.deliveryTime.textContent())?.trim() || '';
    }

    async addToCart(): Promise<void> {
        await this.addToCartButton.click();
    }

    async addToWishlist(): Promise<void> {
        await this.addToWishlistButton.click();
    }

    async addToCompare(): Promise<void> {
        await this.addToCompareButton.click();
    }

    async viewDetails(): Promise<void> {
        await this.productLink.click();
    }

    async assertPrice(expectedPrice: string, message?: string): Promise<void> {
        const actualPrice = await this.getPrice();
        expect(actualPrice, message || `Expected price to be ${expectedPrice}`).toContain(expectedPrice);
    }

    async assertDiscount(expectedDiscount: string, message?: string): Promise<void> {
        const actualDiscount = await this.getDiscount();
        expect(actualDiscount, message || `Expected discount to be ${expectedDiscount}`).toBe(expectedDiscount);
    }
}

export enum SortOption {
    FEATURED = 'Featured',
    NAME_A_TO_Z = 'Name: A to Z',
    NAME_Z_TO_A = 'Name: Z to A',
    PRICE_LOW_TO_HIGH = 'Price: Low to High',
    PRICE_HIGH_TO_LOW = 'Price: High to Low',
    NEWEST_ARRIVALS = 'Newest Arrivals',
}

export enum PageSize {
    SIZE_12 = '12',
    SIZE_24 = '24',
    SIZE_36 = '36',
    SIZE_48 = '48',
    SIZE_72 = '72',
    SIZE_120 = '120',
}
