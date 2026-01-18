import { expect, Locator, Page } from '@playwright/test';
import { BaseElement } from './base.element';

/**
 * Represents the shopping cart side panel (offcanvas)
 */
export class Cart extends BaseElement {

    private static readonly DEFAULT_ROOT_SELECTOR = '#offcanvas-cart';

    constructor(page: Page, rootSelector: string = Cart.DEFAULT_ROOT_SELECTOR) {
        super(page, rootSelector);
    }

    // Tabs
    readonly cartTab = this.root.locator('#cart-tab');
    readonly wishlistTab = this.root.locator('#wishlist-tab');
    readonly compareTab = this.root.locator('#compare-tab');

    // Cart item count badges
    readonly cartItemsCountBadge = this.root.locator('[data-bind-to="CartItemsCount"]');
    readonly wishlistItemsCountBadge = this.root.locator('[data-bind-to="WishlistItemsCount"]');
    readonly compareItemsCountBadge = this.root.locator('[data-bind-to="CompareItemsCount"]');

    // Cart content
    readonly cartContent = this.root.locator('#occ-cart');
    readonly cartItems = this.root.locator('.offcanvas-cart-items');
    readonly cartItemElements = this.cartItems.locator('.offcanvas-cart-item');

    // Footer elements
    readonly subtotalCaption = this.root.locator('.sub-total-caption');
    readonly subtotalPrice = this.root.locator('.sub-total.price');
    readonly goToCartButton = this.root.locator('a[href="/cart"]');
    readonly checkoutButton = this.root.locator('.btn-action').filter({ hasText: 'Checkout' });

    // Success message
    readonly successAlert = this.root.locator('.alert-success');

    // Helper methods

    /**
     * Get a cart item by product name
     */
    getCartItemByName(productName: string): CartItem {
        const itemLocator = this.cartItemElements.filter({
            has: this.page.locator('a.name').filter({ hasText: productName })
        });
        return new CartItem(itemLocator);
    }

    getCartItemByIndex(index: number): CartItem {
        const itemLocator = this.cartItemElements.nth(index);
        return new CartItem(itemLocator);
    }

    /**
     * Remove a specific item from the cart by product name
     */
    async removeItemByName(productName: string): Promise<void> {
        const cartItem = this.getCartItemByName(productName);
        await cartItem.remove();
    }

    /**
     * Get the subtotal price text
     */
    async getSubtotalPrice(): Promise<string> {
        const priceText = await this.subtotalPrice.textContent();
        if (!priceText) {
            throw new Error('Subtotal price not found');
        }
        return priceText.trim();
    }

    /**
     * Get the subtotal price as a numeric value
     */
    async getSubtotalPriceValue(): Promise<number> {
        const priceText = await this.getSubtotalPrice();
        // Extract numeric value from formats like "$59.90 excl tax"
        const match = priceText.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse subtotal price: ${priceText}`);
        }
        return parseFloat(match[1]);
    }

    /**
     * Verify the subtotal price matches expected value
     */
    async assertSubtotalPrice(expectedPrice: string, message?: string): Promise<void> {
        const actualPrice = await this.getSubtotalPrice();
        expect(actualPrice, message || `Expected subtotal to be ${expectedPrice}`).toContain(expectedPrice);
    }

    /**
     * Verify the subtotal price value matches expected numeric value
     */
    async assertSubtotalPriceValue(expectedValue: number, message?: string): Promise<void> {
        const actualValue = await this.getSubtotalPriceValue();
        expect(actualValue, message || `Expected subtotal value to be ${expectedValue}`).toBe(expectedValue);
    }

    /**
     * Get the number of items in the cart
     */
    async getCartItemCount(): Promise<number> {
        return await this.cartItemElements.count();
    }

    /**
     * Navigate to the cart page
     */
    async goToCart(): Promise<void> {
        await this.goToCartButton.click();
        await this.page.waitForURL('**/cart');
    }

    /**
     * Navigate to checkout
     */
    async goToCheckout(): Promise<void> {
        await this.checkoutButton.click();
    }

    /**
     * Close the cart side panel
     */
    async close(): Promise<void> {
        // Click outside the panel or use escape key
        await this.page.keyboard.press('Escape');
    }

    /**
     * Wait for the cart panel to be visible
     */
    async waitForVisible(): Promise<void> {
        await expect(this.root, 'Cart panel should be visible').toBeVisible();
    }

    /**
     * Wait for the cart panel to be hidden
     */
    async waitForHidden(): Promise<void> {
        await expect(this.root, 'Cart panel should be hidden').toBeHidden();
    }

    /**
     * Check if the cart is empty
     */
    async isEmpty(): Promise<boolean> {
        const count = await this.getCartItemCount();
        return count === 0;
    }

    /**
     * Switch to wishlist tab
     */
    async switchToWishlist(): Promise<void> {
        await this.wishlistTab.click();
    }

    /**
     * Switch to compare tab
     */
    async switchToCompare(): Promise<void> {
        await this.compareTab.click();
    }

    /**
     * Switch to cart tab
     */
    async switchToCart(): Promise<void> {
        await this.cartTab.click();
    }
}

/**
 * Represents a single item in the shopping cart
 */
export class CartItem extends BaseElement {

    constructor(itemLocator: Locator) {
        super(itemLocator);
    }

    // Item elements
    readonly productImage = this.root.locator('.img-center-container img');
    readonly productLink = this.root.locator('a.name');
    readonly productName = this.root.locator('a.name');
    readonly shortDescription = this.root.locator('.short-desc');
    
    // Quantity
    readonly quantityInput = this.root.locator('#item_EnteredQuantity, input[name="item.EnteredQuantity"]');
    readonly decreaseQuantityButton = this.root.locator('.bootstrap-touchspin-down');
    readonly increaseQuantityButton = this.root.locator('.bootstrap-touchspin-up');
    
    // Price
    readonly unitPrice = this.root.locator('.unit-price');
    
    // Action buttons
    readonly moveToWishlistButton = this.root.locator('a[data-action="addfromcart"]');
    readonly removeButton = this.root.locator('a.remove[data-action="remove"]');

    // Helper methods

    /**
     * Get the product name
     */
    async getName(): Promise<string> {
        return (await this.productName.textContent())?.trim() || '';
    }

    /**
     * Get the current quantity
     */
    async getQuantity(): Promise<number> {
        const value = await this.quantityInput.inputValue();
        return parseInt(value, 10);
    }

    /**
     * Set the quantity
     */
    async setQuantity(quantity: number): Promise<void> {
        await this.quantityInput.fill(quantity.toString());
        // Trigger blur to update
        await this.quantityInput.blur();
    }

    /**
     * Increase quantity by clicking the + button
     */
    async increaseQuantity(times: number = 1): Promise<void> {
        for (let i = 0; i < times; i++) {
            await this.increaseQuantityButton.click();
        }
    }

    /**
     * Decrease quantity by clicking the - button
     */
    async decreaseQuantity(times: number = 1): Promise<void> {
        for (let i = 0; i < times; i++) {
            await this.decreaseQuantityButton.click();
        }
    }

    /**
     * Get the unit price text
     */
    async getUnitPrice(): Promise<string> {
        const priceText = await this.unitPrice.textContent();
        if (!priceText) {
            throw new Error('Unit price not found');
        }
        return priceText.trim();
    }

    /**
     * Get the unit price as a numeric value
     */
    async getUnitPriceValue(): Promise<number> {
        const priceText = await this.getUnitPrice();
        const match = priceText.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse unit price: ${priceText}`);
        }
        return parseFloat(match[1]);
    }

    /**
     * Remove this item from the cart
     */
    async remove(): Promise<void> {
        await this.removeButton.click();
    }

    /**
     * Move this item to the wishlist
     */
    async moveToWishlist(): Promise<void> {
        await this.moveToWishlistButton.click();
    }

    /**
     * Click on the product to view details
     */
    async viewProductDetails(): Promise<void> {
        await this.productLink.click();
    }
}
