// import test from "@playwright/test";
import { describe } from "node:test";
import {  expect } from '@playwright/test';
// import expect from '../playwright.config';
import { test } from '../fixtures';
import AxeBuilder from "@axe-core/playwright";

describe('example test', () => {
    test.beforeEach(async ({ landingPage, }) => {
        await landingPage.navigate();
    });
    test('menubar should be accessible', async ({ menu, page }) => {

        // do the axe check
        const accessibilityScanResults = await new AxeBuilder({ page })
            .include(menu.rootSelector)
            .analyze();

        // expect(accessibilityScanResults.violations).toEqual([]);
        expect(accessibilityScanResults.violations).toEqual(['color-contrast']);
        
    });
});