import { expect, Locator, Page } from '@playwright/test';
import { BaseElement } from './base.element';

export class Filter extends BaseElement {

    private static readonly DEFAULT_ROOT_SELECTOR = '.faceted-search-container';

    constructor(page: Page, rootSelector: string = Filter.DEFAULT_ROOT_SELECTOR) {
        super(page, rootSelector);
    }

    // Filter sections
    readonly priceSection = this.root.locator('#facet-body-price');
    readonly ratingSection = this.root.locator('#facet-body-rating');
    readonly deliveryTimeSection = this.root.locator('#facet-body-deliveryid');
    readonly availabilitySection = this.root.locator('#facet-body-available');

    // Price filter options (radio buttons)
    readonly priceUpTo10 = this.priceSection.locator('input[type="radio"]').filter({ hasText: PriceRange.UP_TO_10 });
    readonly priceUpTo25 = this.priceSection.locator('input[type="radio"]').filter({ hasText: PriceRange.UP_TO_25 });
    readonly priceUpTo50 = this.priceSection.locator('input[type="radio"]').nth(2);
    readonly priceUpTo100 = this.priceSection.locator('input[type="radio"]').filter({ hasText: PriceRange.UP_TO_100 });
    readonly priceUpTo250 = this.priceSection.locator('input[type="radio"]').filter({ hasText: PriceRange.UP_TO_250 });
    readonly priceUpTo500 = this.priceSection.locator('input[type="radio"]').filter({ hasText: PriceRange.UP_TO_500 });
    readonly priceUpTo1000 = this.priceSection.locator('input[type="radio"]').filter({ hasText: PriceRange.UP_TO_1000 });

    // Custom price range
    readonly priceMinInput = this.priceSection.locator('input[type="number"]').first();
    readonly priceMaxInput = this.priceSection.locator('input[type="number"]').last();
    readonly priceApplyButton = this.priceSection.locator('button[type="submit"]');

    // Rating filter options (radio buttons)
    readonly rating4Plus = this.ratingSection.locator('input[type="radio"]').first();
    readonly rating3Plus = this.ratingSection.locator('input[type="radio"]').nth(1);
    readonly rating2Plus = this.ratingSection.locator('input[type="radio"]').nth(2);
    readonly rating1Plus = this.ratingSection.locator('input[type="radio"]').nth(3);

    // Delivery time filter options (checkboxes)
    readonly deliveryAvailable = this.deliveryTimeSection.getByRole('checkbox', { name: DeliveryTime.AVAILABLE });
    readonly delivery2To5Days = this.deliveryTimeSection.getByRole('checkbox', { name: DeliveryTime.DAYS_2_TO_5 });
    readonly delivery7Days = this.deliveryTimeSection.getByRole('checkbox', { name: DeliveryTime.DAYS_7 });

    // Helper methods
    getPriceOption(priceRange: PriceRange): Locator {
        return this.priceSection.locator('input[type="radio"]').filter({ hasText: priceRange });
    }

    getRatingOption(rating: Rating): Locator {
        const ratingIndex = {
            [Rating.FOUR_PLUS]: 0,
            [Rating.THREE_PLUS]: 1,
            [Rating.TWO_PLUS]: 2,
            [Rating.ONE_PLUS]: 3,
        };
        return this.ratingSection.locator('input[type="radio"]').nth(ratingIndex[rating]);
    }

    getDeliveryTimeOption(deliveryTime: DeliveryTime): Locator {
        return this.deliveryTimeSection.getByRole('checkbox', { name: deliveryTime });
    }

    async selectPriceRange(priceRange: PriceRange): Promise<void> {
        await this.getPriceOption(priceRange).check();
        await expect(this.getPriceOption(priceRange), `${priceRange} should be selected`).toBeChecked();
    }

    async selectRating(rating: Rating): Promise<void> {
        await this.getRatingOption(rating).check();
        await expect(this.getRatingOption(rating), `${rating} should be selected`).toBeChecked();
    }

    async selectDeliveryTime(deliveryTime: DeliveryTime): Promise<void> {
        await this.getDeliveryTimeOption(deliveryTime).check();
        await expect(this.getDeliveryTimeOption(deliveryTime), `${deliveryTime} should be checked`).toBeChecked();
    }

    async setCustomPriceRange(min: number, max: number): Promise<void> {
        await this.priceMinInput.fill(min.toString());
        await this.priceMaxInput.fill(max.toString());
        await this.priceApplyButton.click();
    }

    async clearFilters(): Promise<void> {
        // Uncheck all delivery time checkboxes
        const deliveryCheckboxes = await this.deliveryTimeSection.locator('input[type="checkbox"]:checked').all();
        for (const checkbox of deliveryCheckboxes) {
            await checkbox.uncheck();
        }
    }
}

export enum PriceRange {
    UP_TO_10 = 'up to $10.00',
    UP_TO_25 = 'up to $25.00',
    UP_TO_50 = 'up to $50.00',
    UP_TO_100 = 'up to $100.00',
    UP_TO_250 = 'up to $250.00',
    UP_TO_500 = 'up to $500.00',
    UP_TO_1000 = 'up to $1,000.00',
}

export enum Rating {
    FOUR_PLUS = '4 stars & more',
    THREE_PLUS = '3 stars & more',
    TWO_PLUS = '2 stars & more',
    ONE_PLUS = '1 star & more',
}

export enum DeliveryTime {
    AVAILABLE = 'available and ready to ship',
    DAYS_2_TO_5 = '2-5 woking days',
    DAYS_7 = '7 working days',
}
