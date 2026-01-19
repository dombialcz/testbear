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

    getCartItemByName(productName: string): CartPageItem {
        const itemLocator = this.cartRows.filter({
            has: this.page.locator('.cart-item-link').filter({ hasText: productName })
        });
        return new CartPageItem(itemLocator, this.page);
    }

    getCartItemByIndex(index: number): CartPageItem {
        return new CartPageItem(this.cartRows.nth(index), this.page);
    }

    async getCartItemCount(): Promise<number> {
        return await this.cartRows.count();
    }

    async isEmpty(): Promise<boolean> {
        const count = await this.getCartItemCount();
        return count === 0;
    }

    async getSubtotal(): Promise<string> {
        const text = await this.subtotalValue.textContent();
        return text?.trim() || '';
    }

    async getSubtotalValue(): Promise<number> {
        const text = await this.getSubtotal();
        const match = text.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse subtotal: ${text}`);
        }
        return parseFloat(match[1]);
    }


    async getTotal(): Promise<string> {
        const text = await this.totalValue.textContent();
        return text?.trim() || '';
    }

    async getTotalValue(): Promise<number> {
        const text = await this.getTotal();
        const match = text.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse total: ${text}`);
        }
        return parseFloat(match[1]);
    }

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


    async getName(): Promise<string> {
        return (await this.productName.textContent())?.trim() || '';
    }

    async getUnitPrice(): Promise<string> {
        return (await this.unitPrice.textContent())?.trim() || '';
    }

    async getQuantity(): Promise<number> {
        const value = await this.quantityInput.inputValue();
        return parseInt(value, 10);
    }

    async setQuantity(quantity: number): Promise<void> {
        await this.quantityInput.fill(quantity.toString());
        await this.quantityInput.blur();
    }

    async increaseQuantity(times: number = 1): Promise<void> {
        for (let i = 0; i < times; i++) {
            await this.increaseQuantityButton.click();
        }
    }

    async decreaseQuantity(times: number = 1): Promise<void> {
        for (let i = 0; i < times; i++) {
            await this.decreaseQuantityButton.click();
        }
    }

    async getSubtotal(): Promise<string> {
        return (await this.subtotal.textContent())?.trim() || '';
    }


    async getSubtotalValue(): Promise<number> {
        const text = await this.getSubtotal();
        const match = text.match(/\$?(\d+\.?\d*)/);
        if (!match) {
            throw new Error(`Unable to parse subtotal: ${text}`);
        }
        return parseFloat(match[1]);
    }

    async remove(): Promise<void> {
        await this.removeButton.click();
    }

}
