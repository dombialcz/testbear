import { before, describe } from "node:test";
import {  expect } from '@playwright/test';
// import expect from '../playwright.config';
import { test } from '../fixtures';
import AxeBuilder from "@axe-core/playwright";

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

});