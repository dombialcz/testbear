import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Represents the Login/Sign In page
 */
export class LoginPage extends BasePage {
    url = '/login';

    // Page heading
    readonly pageTitle = this.$('.page-title h1');

    // Sign In form elements
    readonly signInBox = this.$('.login-box');
    readonly usernameOrEmailInput = this.$('#UsernameOrEmail');
    readonly passwordInput = this.$('#Password');
    readonly rememberMeCheckbox = this.$('#RememberMe');
    readonly loginButton = this.$('.btn-login');
    readonly forgotPasswordLink = this.$('a[href="/customer/passwordrecovery"]');

    // Validation and error messages
    readonly validationSummary = this.$('.validation-summary-errors');
    readonly validationErrorMessage = this.validationSummary.locator('ul li');

    // Registration section
    readonly registerBlock = this.$('.register-block');
    readonly registerButton = this.$('a.register-button');
    readonly checkoutAsGuestButton = this.$('a.checkout-as-guest-button');

    // Helper methods

    /**
     * Fill in the login form with credentials
     */
    async fillLoginForm(usernameOrEmail: string, password: string, rememberMe: boolean = false): Promise<void> {
        await this.usernameOrEmailInput.fill(usernameOrEmail);
        await this.passwordInput.fill(password);
        
        if (rememberMe) {
            const isChecked = await this.rememberMeCheckbox.isChecked();
            if (!isChecked) {
                await this.rememberMeCheckbox.check();
            }
        }
    }

    /**
     * Perform login with credentials
     */
    async login(usernameOrEmail: string, password: string, rememberMe: boolean = false): Promise<void> {
        await this.fillLoginForm(usernameOrEmail, password, rememberMe);
        await this.loginButton.click();
    }

    /**
     * Get the validation error message text
     */
    async getValidationError(): Promise<string> {
        if (await this.validationSummary.isVisible()) {
            return (await this.validationErrorMessage.textContent())?.trim() || '';
        }
        return '';
    }

    /**
     * Check if validation error is displayed
     */
    async hasValidationError(): Promise<boolean> {
        return await this.validationSummary.isVisible();
    }

    /**
     * Assert that a validation error is displayed
     */
    async assertValidationError(message?: string): Promise<void> {
        await expect(this.validationSummary, 'Validation error should be visible').toBeVisible();
        
        if (message) {
            const errorText = await this.getValidationError();
            expect(errorText, `Expected error message to contain: ${message}`).toContain(message);
        }
    }

    /**
     * Assert that a specific validation error message is displayed
     */
    async assertValidationErrorContains(expectedText: string): Promise<void> {
        await expect(this.validationSummary, 'Validation error should be visible').toBeVisible();
        await expect(this.validationErrorMessage, `Expected error to contain: ${expectedText}`).toContainText(expectedText);
    }

    /**
     * Assert that the login page is displayed
     */
    async assertLoginPageDisplayed(): Promise<void> {
        await expect(this.pageTitle, 'Login page title should be visible').toBeVisible();
        await expect(this.loginButton, 'Login button should be visible').toBeVisible();
    }

    /**
     * Navigate to registration page
     */
    async goToRegister(): Promise<void> {
        await this.registerButton.click();
    }

    /**
     * Checkout as guest
     */
    async checkoutAsGuest(): Promise<void> {
        await this.checkoutAsGuestButton.click();
    }

    /**
     * Navigate to forgot password page
     */
    async goToForgotPassword(): Promise<void> {
        await this.forgotPasswordLink.click();
    }

    /**
     * Check if remember me is checked
     */
    async isRememberMeChecked(): Promise<boolean> {
        return await this.rememberMeCheckbox.isChecked();
    }

    /**
     * Get the current username/email value
     */
    async getUsernameValue(): Promise<string> {
        return await this.usernameOrEmailInput.inputValue();
    }
}
