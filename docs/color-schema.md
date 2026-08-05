# Color Schema

This project utilizes a highly systematic and semantic color schema implemented using CSS Variables and Tailwind CSS (via NativeWind).

The schema is defined within `src/global.css` under the `:root` and `.dark:root` selectors.

## Base Color Scales (HSL)

Colors are based on an HSL (Hue, Saturation, Lightness) scale providing flexibility across different themes.

- **Primary**: Deep Royal Indigo (`226 71%`). Represents Trust & Stability.
- **Secondary**: Professional Slate (`210 20%`). Used for neutral structures, text, and borders.
- **Tertiary**: Refined Gold (`45 93%`). Used for highlights and value additions.
- **Success**: Forest Green (`145 63%`).
- **Warning**: Deep Amber (`38 92%`).
- **Error**: Crimson Red (`0 84%`).

Each of these base colors provides a scale from `50` (lightest) to `950` (darkest).

## Semantic Color Mappings

Rather than using specific colors directly in components (like `bg-blue-500`), the project maps these scales to Semantic variables. This ensures seamless light/dark mode transitions.

- `--background` & `--foreground`: Used for the primary app background and text.
- `--card` & `--card-foreground`: For card backgrounds.
- `--primary`, `--secondary`, `--accent`: Maps to interactive elements.
- `--destructive`: Maps to error states and delete buttons.
- `--border`, `--input`, `--ring`: For UI controls and borders.

## Status Colors Mappings

Special semantic colors exist directly for application state and records:

- `--unpaid`: Maps to the Warning scale.
- `--paid`: Maps to the Success scale.
- `--partial`: Maps to a custom blue shade (`199 89%`).
- `--overdue`: Maps to the Error scale.

These colors provide foreground, background (`-bg`), and border (`-border`) variants explicitly to style status badges and cards throughout the UI.
