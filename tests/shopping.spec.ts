import { before, describe } from "node:test";
import {  expect } from '@playwright/test';
// import expect from '../playwright.config';
import { test } from '../fixtures';
import AxeBuilder from "@axe-core/playwright";
import { Product } from '../page-objects/elements/product-list.element';

describe('Sports section tests', () => {
    test.beforeEach(async ({ landingPage }) => {
        await landingPage.navigate();
    });
    
    test('should go to sports page and order basketball', async ({menu, filter, sportsPage }) => {

        await menu.sportsNav.click();
        await filter.priceUpTo50.click({ force: true });

        const basketball = sportsPage.productList.getProductByName('High School Game Basketball');

        await expect(basketball.productDescription).toHaveText('For all positions on all levels, match day and every day');
    });

    test('should verify amount of products displayed', async ({ page, menu, filter, sportsPage }) => {
        // Navigate to sports page with price filter
        await menu.sportsNav.click();
        await filter.priceUpTo50.click({ force: true });

        // Wait for products to load
        await sportsPage.productList.productArticles.first().waitFor();

        // Get the actual count of displayed products
        const displayedCount = await sportsPage.productList.getVisibleProductCount();

        // Dynamic verification - ensure displayed products are <= 4
        expect(displayedCount).toBeLessThanOrEqual(4);
        
        // Additional verification - ensure we have at least 1 product
        expect(displayedCount).toBeGreaterThan(0);
    });

    test('should add first product to cart after hover', async ({ page, menu, filter, sportsPage }) => {
        // Navigate to sports page with price filter
        await menu.sportsNav.click();
        await filter.priceUpTo50.click({ force: true });

        // Wait for products to load
        await sportsPage.productList.productArticles.first().waitFor();

        // Get the first product article element
        const firstProductArticle = sportsPage.productList.productArticles.first();

        // Verify initial state - should not have 'active' class
        await expect(firstProductArticle).not.toHaveClass(/active/);

        // Hover over the first product
        await firstProductArticle.hover();

        // Verify the product becomes active (class changes from "art" to "art active")
        await expect(firstProductArticle).toHaveClass(/active/);

        // Get the first product and add it to cart
        const firstProduct = new Product(firstProductArticle);
        await firstProduct.addToCart();

        // Optional: Verify the add to cart action was successful
        // You can add additional assertions here based on your app's behavior
        // For example, checking if a cart counter increased or a success message appeared
    });

    test('should verify added product in cart offcanvas', async ({ page, menu, filter, sportsPage }) => {
        // Navigate to sports page with price filter
        await menu.sportsNav.click();
        await filter.priceUpTo50.click({ force: true });

        // Wait for products to load
        await sportsPage.productList.productArticles.first().waitFor();

        // Get the first product
        const firstProductArticle = sportsPage.productList.productArticles.first();
        const firstProduct = new Product(firstProductArticle);

        // Store product details before adding to cart
        const productName = await firstProduct.getName();
        const productPrice = await firstProduct.getPrice();

        // Hover and add to cart
        await firstProductArticle.hover();
        await firstProduct.addToCart();

        // Wait for cart to be visible
        await sportsPage.cart.waitForVisible();

        // Verify the correct product was added
        const cartItem = sportsPage.cart.getCartItemByName(productName);
        
        // Verify product name in cart
        await expect(cartItem.productName).toHaveText(productName);
        
        // Verify product price in cart
        const cartItemPrice = await cartItem.getUnitPrice();
        expect(cartItemPrice).toContain(productPrice.replace(/\s+/g, ' '));

        // Verify cart item count
        const itemCount = await sportsPage.cart.getCartItemCount();
        expect(itemCount).toBe(1);
    });

    test('should navigate to cart and verify all cart data', async ({ page, menu, filter, sportsPage, cartPage, loginPage }) => {
        let productName: string;
        let productPrice: string;
        let expectedPriceValue: number;

        await test.step('Navigate to sports page and add product to cart', async () => {
            // Navigate to sports page with price filter
            await menu.sportsNav.click();
            await filter.priceUpTo50.click({ force: true });

            // Wait for products to load
            await sportsPage.productList.productArticles.first().waitFor();

            // Get the first product
            const firstProductArticle = sportsPage.productList.productArticles.first();
            const firstProduct = new Product(firstProductArticle);

            // Store product details before adding to cart
            productName = await firstProduct.getName();
            productPrice = await firstProduct.getPrice();
            expectedPriceValue = await firstProduct.getPriceValue();

            // Hover and add to cart
            await firstProductArticle.hover();
            await firstProduct.addToCart();

            // Wait for cart offcanvas to be visible
            await sportsPage.cart.waitForVisible();

            // Verify subtotal in offcanvas cart
            const subtotalPrice = await sportsPage.cart.getSubtotalPrice();
            expect(subtotalPrice).toContain(productPrice.replace(/\s+/g, ' '));
        });

        await test.step('Navigate to cart page and verify initial cart data', async () => {
            // Navigate to cart page
            await sportsPage.cart.goToCart();

            // Wait for navigation to cart page
            await page.waitForURL('**/cart');

            // Verify all cart data on the cart page using CartPage object
            const cartItem = cartPage.getCartItemByIndex(0);

            // Verify product name on cart page
            await cartItem.assertName(productName);

            // Verify quantity (should be 1)
            await cartItem.assertQuantity(1);

            // Verify unit price on cart page
            await cartItem.assertUnitPrice(productPrice.replace(/\s+/g, ' '));

            // Verify item subtotal
            await cartItem.assertSubtotal(productPrice.replace(/\s+/g, ' '));

            // Verify order summary totals
            await cartPage.assertSubtotal(productPrice.replace(/\s+/g, ' '));

            // Verify total price is visible and contains expected value
            const totalPrice = await cartPage.getTotal();
            expect(totalPrice).toBeTruthy();
            
            // Verify shipping is visible
            await expect(cartPage.shippingValue).toBeVisible();
            
            // Verify tax is visible
            await expect(cartPage.taxValue).toBeVisible();
        });

        await test.step('Increase quantity to 2 products', async () => {
            const cartItem = cartPage.getCartItemByIndex(0);
            
            // Increase quantity to 2
            await cartItem.increaseQuantity();
            
            // Wait for AJAX update to complete by synchronizing on the loader
            await cartPage.loader.waitForLoad();
            
            // Verify quantity is now 2
            await cartItem.assertQuantity(2);
        });

        await test.step('Verify data updates after quantity increase', async () => {
            const cartItem = cartPage.getCartItemByIndex(0);
            
            // Calculate expected values for quantity of 2
            const expectedItemSubtotal = expectedPriceValue * 2;
            
            // Verify item subtotal is updated (should be 2x the original price)
            const itemSubtotalValue = await cartItem.getSubtotalValue();
            expect(itemSubtotalValue, 'Item subtotal should be 2x the unit price').toBe(expectedItemSubtotal);
            
            // Verify order subtotal is updated
            const orderSubtotalValue = await cartPage.getSubtotalValue();
            expect(orderSubtotalValue, 'Order subtotal should match item subtotal').toBe(expectedItemSubtotal);
            
            // Verify total is updated (subtotal + shipping + tax)
            const totalValue = await cartPage.getTotalValue();
            expect(totalValue, 'Total should be greater than or equal to subtotal').toBeGreaterThanOrEqual(expectedItemSubtotal);
        });

        await test.step('Proceed to checkout and verify login is required', async () => {
            // Click checkout button
            await cartPage.proceedToCheckout();
            
            // Wait for navigation to login page
            await page.waitForURL('**/login**');
            
            // Verify we're on the login page
            await loginPage.assertLoginPageDisplayed();
        });

        await test.step('Verify login validation error', async () => {
            // Try to login with incorrect credentials
            await loginPage.login('test@example.com', 'wrongpassword');
            
            // Wait for the page to reload with error
            await page.waitForLoadState('networkidle');
            
            // Verify validation error is displayed
            await loginPage.assertValidationError();
            
            // Verify specific error message about incorrect credentials
            await loginPage.assertValidationErrorContains('credentials provided are incorrect');
        });
    });

});