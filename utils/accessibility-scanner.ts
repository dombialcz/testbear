import type { AxeResults, NodeResult, Result } from 'axe-core';
import { Locator, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class AccessibilityScanner {
  private page: Page;
  private _tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
  private _scanResults: AxeResults;
  private _modalWindowSelector = '.modal-content-container';

  constructor(page: Page) {
    this.page = page;
  }

  get tags(): string[] {
    return this._tags;
  }

  set tags(tags: string[]) {
    this._tags = tags;
  }

  private _generateHighlightingStyle(
    elementPosition: { offsetTop: number; offsetLeft: number },
    elementSize: { height: number; width: number },
  ): string {
    return `border-width: 1px border-style: solid; border-color: #eb34c9; box-shadow: 0 0 10px 4px #e267ff; height: ${elementSize.height}px; width: ${elementSize.width}px;  position: absolute; left: ${elementPosition.offsetLeft}px; top: ${elementPosition.offsetTop}px; z-index: 9999999;`;
  }

  /**
   * Return all results of scan.
   * Throw an error if a scan not been run yet.
   * ```js
   * Usage:
   * const a11yScanner = new AccessibilityScanner(page);
   * await a11yScanner.scanPage();
   * const scanResults = a11yScanner.scanResults;
   * ```
   */
  get scanResults(): AxeResults {
    if (!this._scanResults) throw Error('Please run a scan before calling .scanResults');
    return this._scanResults;
  }

  /**
   * Scans the page or page element for accessibility violations.
   * ```js
   * Usage:
   * const a11yScanner = new AccessibilityScanner(page);
   * await a11yScanner.scanPage();
   * or
   * const scanResults = await a11yScanner.scanPage();
   * or
   * await a11yScanner.scanPage('html_tag');
   * or
   * await a11yScanner.scanPage('css_selector');
   * or
   * await a11yScanner.scanPage(locator);
   * ```
   * @param include Playwright Locator or CSS selector
   */
  async scanPage(include?: Locator | string): Promise<AxeResults> {
    let axeBuilder = new AxeBuilder({ page: this.page }).withTags(this._tags);

    if (include) {
      // TODO: check locator modification
      // const selectorForInclude = this._transformToCSSSelector(include).replaceAll(' >> ', ' ');
      // axeBuilder = axeBuilder.include(selectorForInclude);
      axeBuilder = axeBuilder.include(include);
    }

    // Some elements like modals fade in on open. May give false contrast errors when scanned too fast.
    await this.page.waitForTimeout(2000);
    const scanResult = await axeBuilder.analyze();
    this._scanResults = scanResult;
    return scanResult;
  }

  /**
   * Transform the playwright locator into a CSS selector if it was given.
   * @param include Playwright Locator or CSS selector.
   */
  private _transformToCSSSelector(include: Locator | string): string {
    return isLocator(include) ? include['_selector'] : include;
  }

  /**
   * Extract nodes of violated elements from scan results.
   */
  private _getNodes(): NodeResult[] {
    const nodes = [];

    this._scanResults.violations.forEach(violation => {
      violation.nodes.forEach(node => {
        nodes.push(node);
      });
    });

    return nodes;
  }

  /**
   * Extract selectors of violated elements from scan results.
   */
  private _getSelectorsOfViolatedElements(): string[] {
    const selectors: string[] = [];

    this._scanResults.violations.forEach(violation => {
      violation.nodes.forEach(node => {
        selectors.push(node.target[0] as string);
      });
    });

    return selectors;
  }

  /**
   * Highlight violated elements.
   * Throw an error if a scan not been run yet.
   * ```js
   * Usage
   * const a11yScanner = new AccessibilityScanner(page);
   * await a11yScanner.scanPage();
   * await a11yScanner.highlightViolations();
   * ```
   */
  async highlightViolations(): Promise<void> {
    if (!this._scanResults) throw new Error('Please run a scan before calling .highlightViolations()');
    await this._modifyViewPortSize();

    const selectors = this._getSelectorsOfViolatedElements();

    for (const selector of selectors) {
      const elementPosition = await this.page.evaluate(selector => {
        function getOffsetValuesRecursive(element) {
          if (!element.offsetParent) {
            return {
              offsetTop: element.offsetTop,
              offsetLeft: element.offsetLeft,
            };
          }

          const parentOffsetValues = getOffsetValuesRecursive(element.offsetParent);

          return {
            offsetTop: parentOffsetValues.offsetTop + element.offsetTop,
            offsetLeft: parentOffsetValues.offsetLeft + element.offsetLeft,
          };
        }

        return getOffsetValuesRecursive(document.querySelector(selector));
      }, selector);

      const elementSize = await this.page.evaluate(selector => {
        return {
          height: (document.querySelector(selector) as HTMLElement).offsetHeight,
          width: (document.querySelector(selector) as HTMLElement).offsetWidth,
        };
      }, selector);

      const styleAttributes = this._generateHighlightingStyle(elementPosition, elementSize);

      await this.page.evaluate(styleAttributes => {
        const highlightedElement = document.createElement('div');
        highlightedElement.setAttribute('style', styleAttributes);
        document.body.appendChild(highlightedElement);
      }, styleAttributes);
    }
  }

  /**
   * The current viewport height will be scaled to modal window height if the modal window is visible, and it has a height bigger than the current viewport height.
   */
  private async _modifyViewPortSize(): Promise<void> {
    if ((await this.page.locator(this._modalWindowSelector).count()) > 0) {
      const currentViewportSize = this.page.viewportSize();
      const modalWindowHeight: number = await this.page.evaluate(
        `document.querySelector('${this._modalWindowSelector}').offsetHeight`,
      );

      if (modalWindowHeight > currentViewportSize.height) {
        await this.page.setViewportSize({ height: modalWindowHeight + 100, width: currentViewportSize.width });
      }
    }
  }

  /**
   * Create a report of violations that contains detailed information.
   * Throw an error if a scan not been run yet.
   * ```js
   * const a11yScanner = new AccessibilityScanner(page);
   * await a11yScanner.scanPage();
   * const  scanResults = a11yScanner.generateViolationsReport();
   * ```
   */
  generateViolationsReport(): Result[] {
    if (!this._scanResults) throw new Error('Please run a scan before calling .violationsReport()');
    return this._scanResults.violations;
  }

  /**
   * Create a report of violations that contains short information.
   * Throw an error if a scan not been run yet.
   * ```js
   * Usage:
   * const a11yScanner = new AccessibilityScanner(page);
   * await a11yScanner.scanPage();
   * const scanResults = a11yScanner.generateShortReport();
   * ```
   * ```
   * Example of report:
   * 1 Elements must have sufficient color contrast
   * Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds
   *
   * 1.1. <span class="DocSearch-Button-Placeholder">Search</span>
   * Fix any of the following:
   *   Element has insufficient color contrast of 2.27 (foreground color: #969faf, background color: #ebedf0, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1
   * ```
   */
  generateShortReport(): string {
    if (!this._scanResults) throw new Error('Please run a scan before calling .generateShortReport()');

    const nodes = this._getNodes();

    let report = `${this._scanResults.violations.length} rules were violated in ${nodes.length} places:\n\n`;

    this._scanResults.violations.forEach((violation, violationIndex) => {
      report += `\n${violationIndex + 1} ${violation.help}\n${violation.description}\n\n`;

      violation.nodes.forEach((node, nodeIndex) => {
        report += `${violationIndex + 1}.${nodeIndex + 1}. ${node.html}\n${node.failureSummary}\n\n`;
      });
    });

    return report;
  }
}
