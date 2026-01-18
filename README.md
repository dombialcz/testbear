# OneRail Test Automation

A Playwright-based test automation framework for end-to-end testing.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

### Run all tests (headless mode)
```bash
npm test
```

### Run tests with UI mode (interactive)
```bash
npm run test:ui
```

### Run specific test file
```bash
npx playwright test tests/shopping.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

## Project Structure

- `tests/` - Test specifications
- `page-objects/` - Page Object Model implementation
- `fixtures/` - Custom Playwright fixtures
- `utils/` - Utility functions and helpers
- `app/` - Demo application for testing


## Playwright Installation Check

To verify Playwright browsers are installed:
```bash
npx playwright install --dry-run
```

## Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```
