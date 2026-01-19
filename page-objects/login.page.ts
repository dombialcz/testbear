import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

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

    // Helper methods
    private async fillLoginForm(usernameOrEmail: string, password: string, rememberMe: boolean = false): Promise<void> {
        await this.usernameOrEmailInput.fill(usernameOrEmail);
        await this.passwordInput.fill(password);
        
        if (rememberMe) {
            const isChecked = await this.rememberMeCheckbox.isChecked();
            if (!isChecked) {
                await this.rememberMeCheckbox.check();
            }
        }
    }
    
    async login(usernameOrEmail: string, password: string, rememberMe: boolean = false): Promise<void> {
        await this.fillLoginForm(usernameOrEmail, password, rememberMe);
        await this.loginButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}
