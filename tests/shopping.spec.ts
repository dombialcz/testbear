import {  expect } from '@playwright/test';
// import expect from '../playwright.config';
import { test } from '../fixtures';
import AxeBuilder from "@axe-core/playwright";
import { Product } from '../page-objects/elements/product-list.element';

test.describe('Sports section navigation tests  @nav', () => {

    test.describe('Navigation', () => {
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
            const expectedArticles = 4;

            await menu.sportsNav.click();
            await filter.priceUpTo50.click({ force: true });

            await sportsPage.productList.productArticles.first().waitFor();
            
            expect (sportsPage.productList.productArticles).toHaveCount(expectedArticles);
        });
    });

});

test.describe('Sports section action tests @action', () => {

    test.describe('Cart and checkout', () => {
        // Session is server side, avoid race condition by clearing cart in serial mode
        test.describe.configure({ mode: 'serial' });

        test.beforeEach(async ({ sportsPage, cartPage }) => {
            await cartPage.navigate();
            
            // Only clear if cart has items to avoid unnecessary operations
            const isEmpty = await cartPage.isEmpty();
            if (!isEmpty) {
                await cartPage.clearAllItems();
            }
            
            await sportsPage.navigate();
        });
        
        test('should add first product to cart after hover', async ({ page, menu, filter, sportsPage }) => {
            await test.step('should display products after filtering by price', async () => {
                await menu.sportsNav.click();
                await filter.priceUpTo50.click({ force: true });

                await sportsPage.productList.productArticles.first().waitFor();

                await expect(sportsPage.productList.productArticles.first()).toBeVisible();
            });

            await test.step('should set item to active after hover', async () => {
                const firstProductArticle = sportsPage.productList.productArticles.first();

                await expect(firstProductArticle).not.toHaveClass(/active/);

                await firstProductArticle.hover();

                await expect(firstProductArticle).toHaveClass(/active/);
            });

            await test.step('should add product to cart', async () => {
                const firstProduct = await sportsPage.productList.getNthProduct(0);
                await firstProduct.addToCart();
                
                await expect(sportsPage.cart.cartItemElements).toBeVisible();
                await expect(sportsPage.cart.cartItemElements).toHaveCount(1);
            });
        });

        // the data can change
        test.skip('should verify added product is in cart', async ({ page, menu, filter, sportsPage }) => {
            const productName = 'Titleist Pro V1x';
            const productPrice = '$2.10 excl tax';

            await menu.sportsNav.click();
            await filter.priceUpTo50.click({ force: true });

            await sportsPage.productList.productArticles.first().waitFor();

            const firstProduct = await sportsPage.productList.getNthProduct(0);
            
            await firstProduct.select();
            await firstProduct.addToCart();

            await sportsPage.cart.waitForVisible();
            const cartItem = sportsPage.cart.getCartItemByIndex(0);
            
            await expect(cartItem.productName).toHaveText(productName);
            
            const cartItemPrice = await cartItem.getUnitPrice();
            expect(cartItemPrice).toContain(productPrice);

            const itemCount = await sportsPage.cart.getCartItemCount();
            expect(itemCount).toBe(1);
        });

        test('should navigate to cart and verify all cart data', async ({ page, menu, filter, sportsPage, cartPage, loginPage }) => {
            let productName: string;
            let productPrice: string;
            let expectedPriceValue: number;

            await test.step('should add product to the cart', async () => {
                await filter.priceUpTo50.click({ force: true });

                await sportsPage.productList.productArticles.first().waitFor();

                const firstProduct = await sportsPage.productList.getNthProduct(0);

                productName = await firstProduct.getName();
                productPrice = (await firstProduct.getPrice()).replace(/\s+/g, ' ').replace(' excl tax', '');
                expectedPriceValue = await firstProduct.getPriceValue();

                await firstProduct.select();
                await firstProduct.addToCart();

                await sportsPage.cart.waitForVisible();

                await expect ( sportsPage.cart.subtotalPrice).toContainText(productPrice);
            });

            await test.step('should navigate to cart page and verify initial cart data', async () => {
                await sportsPage.cart.goToCart();

                const cartItem = cartPage.getCartItemByIndex(0);

                const totalPrice = await cartPage.getTotal();
                expect.soft(totalPrice).toContain(productPrice);

                expect.soft(await cartItem.getName(), 'Cart item name should match added product').toBe(productName);
                expect.soft(await cartItem.getUnitPrice(), 'Cart item unit price should match added product price').toBe(`${productPrice} excl tax`);
                expect.soft(await cartPage.getSubtotal(), 'Cart subtotal should match product price').toBe(`${productPrice} excl tax`);

                await expect(cartPage.shippingValue).toBeVisible();
                await expect(cartPage.taxValue).toBeVisible();
            });

            await test.step('Increase quantity to 2 products', async () => {
                const cartItem = cartPage.getCartItemByIndex(0);
                
                await cartItem.increaseQuantity();
                await cartPage.loader.waitForLoad();
                
                expect (await cartItem.getQuantity(), 'Cart item quantity should be 2 after increase').toBe(2);
            });

            await test.step('Verify data updates after quantity increase', async () => {
                const expectedItemSubtotal = expectedPriceValue * 2;

                const cartItem = cartPage.getCartItemByIndex(0);
    
                expect.soft(await cartItem.getSubtotalValue(), 'Item subtotal should be 2x the unit price').toBe(expectedItemSubtotal);
                expect.soft(await cartPage.getSubtotalValue(), 'Order subtotal should match item subtotal').toBe(expectedItemSubtotal);
                expect.soft(await cartPage.getTotalValue(), 'Total should be greater than or equal to subtotal').toBeGreaterThanOrEqual(expectedItemSubtotal);
            });

            await test.step('Proceed to checkout and verify login is required @security', async () => {
                await cartPage.proceedToCheckout();
                
                await expect(loginPage.pageTitle, 'Login page title should be visible').toBeVisible();
                await expect(loginPage.loginButton, 'Login button should be visible').toBeVisible();
            });

            await test.step('Verify login validation error @negative', async () => {
                const expectedErrorMessage = 'credentials provided are incorrect';
                await loginPage.login('test@example.com', 'wrongpassword');
                
                await expect.soft(loginPage.validationSummary, 'Validation error should be visible').toBeVisible();
                await expect.soft(loginPage.validationSummary, 'Validation error should be visible').toBeVisible();
                await expect.soft(loginPage.validationErrorMessage, `Expected error to contain: ${expectedErrorMessage}`).toContainText(expectedErrorMessage);
            });
        });
    });

});