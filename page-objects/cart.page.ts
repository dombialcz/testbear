import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { BaseElement } from './elements/base.element';
import { Loader } from './elements/loader.element';

/**
 * Represents the Shopping Cart page (/cart)
 */
export class CartPage extends BasePage {
    url = '/cart';

    // Loader/spinner for AJAX operations
    loader = new Loader(this.page);

    // Main container
    readonly cartContent = this.$('.order-summary-content.cart-content');
    readonly cartForm = this.$('form[action="/cart"]');
    readonly cartItemsContainer = this.$('#cart-items.cart');

    // Cart items
    readonly cartBody = this.cartItemsContainer.locator('.cart-body');
    readonly cartRows = this.cartBody.locator('.cart-row');

    // Order totals
    readonly orderTotals = this.$('#order-totals');
    readonly cartSummary = this.orderTotals.locator('.cart-summary');
    readonly subtotalRow = this.cartSummary.locator('.cart-summary-subtotal');
    readonly subtotalValue = this.subtotalRow.locator('.cart-summary-value');
    readonly shippingRow = this.cartSummary.locator('.cart-summary-shipping');
    readonly shippingValue = this.shippingRow.locator('.cart-summary-value');
    readonly taxRow = this.cartSummary.locator('.cart-summary-tax');
    readonly taxValue = this.taxRow.locator('.cart-summary-value');
    readonly totalRow = this.cartSummary.locator('.cart-summary-total');
    readonly totalValue = this.totalRow.locator('.cart-summary-value');

    // Action buttons
    readonly continueShoppingButton = this.$('button[name="continueshopping"]');
    readonly checkoutButton = this.$('button#checkout');

    // Cart actions (discount, gift card, shipping estimate)
    readonly discountCodeSection = this.$('.cart-action-coupon');
    readonly discountCodeInput = this.$('input[name="discountcouponcode"]');
    readonly applyDiscountButton = this.$('button[name="applydiscountcouponcode"]');
    
    readonly giftCardSection = this.$('.cart-action-giftcard');
    readonly giftCardInput = this.$('input[name="giftcardcouponcode"]');
    readonly applyGiftCardButton = this.$('button[name="applygiftcardcouponcode"]');
    
    readonly shippingEstimateSection = this.$('.cart-action-shipping');

    // Helper methods

    /**
     * Get a cart item by product name
     */
    getCartItemByName(productName: string): CartPageItem {
        const itemLocator = this.cartRows.filter({
            has: this.page.locator('.cart-item-link').filter({ hasText: productName })
        });
        return new CartPageItem(itemLocator, this.page);
    }

    /**
     * Get cart item by index (0-based)
     */
    getCartItemByIndex(index: number): CartPageItem {
        return new CartPageItem(this.cartRows.nth(index), this.page);
    }

    /**
     * Get the number of items in the cart
     */
    async getCartItemCount(): Promise<number> {
        return await this.cartRows.count();
    }

    /**
     * Check if cart is empty
     */
    async isEmpty(): Promise<boolean> {
        const count = await this.getCartItemCount();
        return count === 0;
    }

    /**
     * Get the subtotal value text
     */
    async getSubtotal(): Promise<string> {
        const text = await this.subtotalValue.textContent();
        return text?.trim() || '';
    }

    /**
     * Get the subtotal as a numeric value
     */
    async getSubtotalValue(): Promise<number> {
        const text = await this.getSubtotal();
        const match = text.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse subtotal: ${text}`);
        }
        return parseFloat(match[1]);
    }

    /**
     * Get the shipping value text
     */
    async getShipping(): Promise<string> {
        const text = await this.shippingValue.textContent();
        return text?.trim() || '';
    }

    /**
     * Get the shipping as a numeric value
     */
    async getShippingValue(): Promise<number> {
        const text = await this.getShipping();
        const match = text.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse shipping: ${text}`);
        }
        return parseFloat(match[1]);
    }

    /**
     * Get the tax value text
     */
    async getTax(): Promise<string> {
        const text = await this.taxValue.textContent();
        return text?.trim() || '';
    }

    /**
     * Get the tax as a numeric value
     */
    async getTaxValue(): Promise<number> {
        const text = await this.getTax();
        const match = text.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse tax: ${text}`);
        }
        return parseFloat(match[1]);
    }

    /**
     * Get the total value text
     */
    async getTotal(): Promise<string> {
        const text = await this.totalValue.textContent();
        return text?.trim() || '';
    }

    /**
     * Get the total as a numeric value
     */
    async getTotalValue(): Promise<number> {
        const text = await this.getTotal();
        const match = text.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse total: ${text}`);
        }
        return parseFloat(match[1]);
    }
    /**
     * Apply discount code
     */
    async applyDiscountCode(code: string): Promise<void> {
        // Expand the section if collapsed
        const isExpanded = await this.discountCodeSection.locator('.cart-action-body').isVisible();
        if (!isExpanded) {
            await this.discountCodeSection.locator('.cart-action-title').click();
        }
        
        await this.discountCodeInput.fill(code);
        await this.applyDiscountButton.click();
    }

    /**
     * Apply gift card
     */
    async applyGiftCard(code: string): Promise<void> {
        // Expand the section if collapsed
        const isExpanded = await this.giftCardSection.locator('.cart-action-body').isVisible();
        if (!isExpanded) {
            await this.giftCardSection.locator('.cart-action-title').click();
        }
        
        await this.giftCardInput.fill(code);
        await this.applyGiftCardButton.click();
    }

    /**
     * Continue shopping
     */
    async continueShopping(): Promise<void> {
        await this.continueShoppingButton.click();
    }

    /**
     * Proceed to checkout
     */
    async proceedToCheckout(): Promise<void> {
        await this.checkoutButton.click();
        await this.page.waitForURL('**/login**');
    }

    /**
     * Clear all items from the cart
     */
    async clearAllItems(): Promise<void> {
        let itemCount = await this.getCartItemCount();
        
        while (itemCount > 0) {
            const item = this.getCartItemByIndex(0);
            await item.remove();
            await this.loader.waitForLoad();
            itemCount = await this.getCartItemCount();
        }
    }
}

/**
 * Represents a single item row on the cart page
 */
export class CartPageItem extends BaseElement {

    constructor(itemLocator: Locator, page: Page) {
        super(itemLocator);
    }

    // Product information
    readonly productImage = this.root.locator('.cart-item-img img');
    readonly productLink = this.root.locator('.cart-item-link');
    readonly productName = this.root.locator('.cart-item-link');
    readonly productDescription = this.root.locator('.cart-item-desc');
    readonly deliveryDate = this.root.locator('.delivery-date');

    // Price columns
    readonly priceColumn = this.root.locator('.cart-col-price').first();
    readonly unitPrice = this.priceColumn.locator('.price');
    readonly quantityColumn = this.root.locator('.cart-col-qty');
    readonly quantityInput = this.quantityColumn.locator('.qty-input input');
    readonly increaseQuantityButton = this.quantityColumn.locator('.bootstrap-touchspin-up');
    readonly decreaseQuantityButton = this.quantityColumn.locator('.bootstrap-touchspin-down');
    readonly subtotalColumn = this.root.locator('.cart-col-subtotal');
    readonly subtotal = this.subtotalColumn.locator('.price');

    // Action buttons
    readonly removeButton = this.root.locator('a[data-action="remove"]');
    readonly moveToWishlistButton = this.root.locator('a[data-action="addfromcart"]');

    // Helper methods

    /**
     * Get the product name
     */
    async getName(): Promise<string> {
        return (await this.productName.textContent())?.trim() || '';
    }

    /**
     * Get the product description
     */
    async getDescription(): Promise<string> {
        return (await this.productDescription.textContent())?.trim() || '';
    }

    /**
     * Get the unit price text
     */
    async getUnitPrice(): Promise<string> {
        return (await this.unitPrice.textContent())?.trim() || '';
    }

    /**
     * Get the unit price as a numeric value
     */
    async getUnitPriceValue(): Promise<number> {
        const text = await this.getUnitPrice();
        const match = text.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse unit price: ${text}`);
        }
        return parseFloat(match[1]);
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
     * Get the subtotal text (quantity * unit price)
     */
    async getSubtotal(): Promise<string> {
        return (await this.subtotal.textContent())?.trim() || '';
    }

    /**
     * Get the subtotal as a numeric value
     */
    async getSubtotalValue(): Promise<number> {
        const text = await this.getSubtotal();
        const match = text.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse subtotal: ${text}`);
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
     * Click on the product link to view details
     */
    async viewProductDetails(): Promise<void> {
        await this.productLink.click();
    }
}
