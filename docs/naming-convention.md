# Naming Conventions

To maintain consistency and readability across the codebase, we adhere to the following naming conventions:

## 1. React Components
- **Format**: `PascalCase`
- **Example**: `PaymentRecordCard.tsx`, `SearchAndFilter.tsx`
- **Details**: Every React Component file should be named using PascalCase. The component function exported inside should match the filename exactly.

## 2. Hooks
- **Format**: `camelCase` (prefixed with `use`)
- **Example**: `useUserCurrency.ts`, `useColorScheme.ts`
- **Details**: Custom React hooks must start with the word `use` in accordance with React's Rules of Hooks.

## 3. Utilities & Services
- **Format**: `camelCase` or `kebab-case` with specific suffixes.
- **Example**: `utils.ts`, `book-entry.service.ts`
- **Details**: Pure utility files and API services use lowercase file naming.

## 4. Expo Router Screens
- **Format**: `kebab-case` or `index`
- **Example**: `pay-book`, `collect-book`, `index.tsx`, `add-selection.tsx`
- **Details**: Since Expo Router relies on the filesystem for URL generation, directory names and file names in the `app/` folder should be lowercase to form clean, web-friendly URLs.

## 5. Variables & Functions
- **Format**: `camelCase`
- **Example**: `handleMarkPayment`, `totalRemainingToPay`
- **Details**: All standard TypeScript/JavaScript variables and functions should be written in standard camelCase. Constants defined at the module scope can use `UPPER_SNAKE_CASE` (e.g. `FILTER_SORT_OPTIONS`).
