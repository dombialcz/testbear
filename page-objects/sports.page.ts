import { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Filter } from './elements/filter.element';
import { ProductList } from './elements/product-list.element';
import { ActiveFilters } from './elements/active-filters.element';
import { Cart } from './elements/cart.element';

export class SportsPage extends BasePage {
    url = '/sports';

    // Element components
    filter = new Filter(this.page);
    productList = new ProductList(this.page);
    activeFilters = new ActiveFilters(this.page);
    cart = new Cart(this.page);

    // Tab navigation elements
    readonly onTheGoTab = this.$('#tab-on-the-go');
    readonly digitalWebTab = this.$('#tab-digital-web');
    readonly shopAndFlyTab = this.$('#tab-shop-fly');
    readonly checkInTab = this.$('#tab-online-check-in');
    readonly ancillariesTab = this.$('#tab-ancillaries-marketplace');
    readonly stopAndStayTab = this.$('#tab-stop-stay');
    readonly memberExperiencesTab = this.$('#tab-loyalty');
    readonly paymentOrchestrationTab = this.$('#tab-payments');
    readonly controlHubTab = this.$('#tab-control-hub');
    readonly skyMetrixTab = this.$('#tab-skymetrix');
    readonly uxUiDesignTab = this.$('#tab-ux-ui');

    async isTabSelected(tab: Locator): Promise<boolean> {
        const ariaSelected = await tab.getAttribute('aria-selected');
        return ariaSelected === 'true';
    }
}
