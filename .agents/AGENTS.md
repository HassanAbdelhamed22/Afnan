# Workspace Design Rules & Behavior Contracts

All AI coding agents working on Afnan must strictly conform to the **Afnan Editorial Design System** defined in `DESIGN.md`. Do not drift from these visual boundaries.

---

## 1. Zero Shadow & Tonal Layering Policy
*   **No Drop Shadows**: Under no circumstances should any element utilize shadow classes (`shadow-*`, `box-shadow`).
*   **Depth Representation**: Grouping and focus must be expressed solely through tonal backgrounds (e.g. `bg-surface` vs. `bg-background`) or solid 1px outlines (`border-outline-variant`).
*   **Dividers**: Hairline dividers should use 1px borders in `border-outline-variant` to simulate score marks on fine paper.

---

## 2. Sharp Corners (0px Roundedness) Policy
*   **Crisp 90-degree Edges**: All components, including buttons, inputs, tags, badges, images, dialogs, and cards, must have crisp corners. 
*   **Utility Restrictions**: Do not use rounded border-radius classes (`rounded-sm`, `rounded-md`, `rounded-lg`, etc.). Even if used, theme variables force them to `0px`. Always prefer sharp edges.

---

## 3. Typography Pairings
Always use the custom editorial typography classes defined in `globals.css`:
*   `display-lg` and `display-lg-mobile`: High-level titles, storytelling features (EB Garamond, serif).
*   `headline-lg`, `headline-md`, `headline-sm`: Page and section headings (EB Garamond, serif).
*   `body-lg`, `body-md`, `body-sm`: Body copy, descriptions, details (Manrope, sans-serif).
*   `label-caps`: Prices, tags, uppercase labels, and buttons (Manrope, uppercase, tracking-wider).

---

## 4. Component Implementation Specifications

### Buttons
*   **Primary Button**: Use `bg-primary text-on-primary font-sans label-caps hover:bg-neutral-800 transition-colors ease-expo-out duration-300`. Crisp corners, no shadows.
*   **Secondary Button**: Use `bg-transparent border border-primary text-primary font-sans label-caps hover:bg-surface-container-low transition-colors ease-expo-out duration-300`.
*   **Text Link**: Use `font-sans label-caps hover:opacity-60 transition-opacity underline underline-offset-4`.

### Forms and Input Fields
*   **Inputs**: Must use the bottom underline style. Apply `border-b border-outline-variant bg-transparent text-on-background focus:border-primary outline-none transition-colors ease-expo-out duration-300`. No fully boxed input frames.
*   **Labels**: Place text using the `label-caps` class directly above input fields.

### Product Cards
*   **Layout**: Borderless and shadowless. The image occupies 100% card width with `object-contain` or custom ratio. Product titles use serif headings (`font-serif`) and prices use `font-sans`.

### Maker's Note Component
*   **Structure**: Container styled with `bg-surface border border-outline-variant py-8 px-6 text-on-surface`. Used on product detail pages for storytelling.
