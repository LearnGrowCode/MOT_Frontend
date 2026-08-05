# Expo Router and The Index File

In an Expo Router project, routing is file-based and revolves around the `app/` directory and its `index.tsx` files.

## `index.tsx`

- **The Entry Point**: Whenever a directory inside `app/` is navigated to without a specific filename, Expo Router resolves to `index.tsx`.
- Example: Navigating to `/(main)/pay-book` will render the component exported in `src/app/(main)/pay-book/index.tsx`.
- **Purpose**: It serves as the main screen or dashboard for a particular route grouping.

## Layouts (`_layout.tsx`)

- `_layout.tsx` files wrap the screens in the same directory. They are often used to provide a Navigation container (like a Stack or Tabs) and wrap the app in Context Providers.

## Route Groups (`(folder)`)

- Folders wrapped in parentheses, such as `(main)` or `(screen)`, do not affect the URL path. They are strictly used to group routes logically or to apply a specific `_layout.tsx` to a subset of screens without altering deep links or the URL schema.
