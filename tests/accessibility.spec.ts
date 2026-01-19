// import test from "@playwright/test";
import {  expect } from '@playwright/test';
// import expect from '../playwright.config';
import { test } from '../fixtures';
import AxeBuilder from "@axe-core/playwright";

test.describe.skip('example test', () => {
    test.beforeEach(async ({ cartPage, }) => {
        await cartPage.navigate();
    });
    test('cart should be accessible', async ({ cartPage, page }) => {

        // do the axe check
        const accessibilityScanResults = await new AxeBuilder({ page })
            .include('.order-summary-content.cart-content')
            .analyze();

        // expect(accessibilityScanResults.violations).toEqual([]);
        expect(accessibilityScanResults.violations).toEqual([]);
        
    });
});