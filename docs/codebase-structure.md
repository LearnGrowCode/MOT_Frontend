# Codebase Structure

This project follows a feature-based architectural pattern integrated with Expo Router for navigation, ensuring scalability and maintainability.

## Root Directory

- `src/`: Contains the majority of the application source code.
- `docs/`: Project documentation.
- `app.json` / `eas.json`: Expo and EAS configuration.
- `tailwind.config.js`: Tailwind CSS configuration (using NativeWind).
- `package.json`: Dependencies and scripts.

## `src/` Directory Breakdown

- **`app/`**: Contains the Expo Router file-based routing mechanism.
  - Groups routes using `(main)` and `(screen)` paradigms.
  - Controls the top-level app layout (`_layout.tsx`).
- **`db/`**: Handles database interactions, typically defining SQLite models, schema, and basic queries.
- **`features/`**: Feature modules. Code is grouped by its business capability rather than by technical concern.
  - Example: `features/books` (handles Logic, UI components, and API calls related specifically to the pay/collect books).
  - Example: `features/account` (handles user settings and preferences).
- **`shared/`**: Contains reusable elements shared across the entire application.
  - `components/`: UI elements like Cards, Buttons, Modals, and basic building blocks (using UI primitives).
  - `hooks/`: Reusable React Hooks.
  - `utils/`: Helper functions.
- **`store/`**: Global state management configuration, utilizing Zustand.
- **`global.css`**: Defines global styling, Tailwind configurations, and CSS variable mappings for colors and themes.
