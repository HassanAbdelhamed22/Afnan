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

---

## 5. Database & Authentication Design Rules
*   **Better Auth User References**: Better Auth uses string user IDs by default. Therefore, your business collections (like carts, orders, custom requests) must use a **String** for authentication and user references:
    ```typescript
    userId: {
      type: String,
      required: true,
      index: true,
    }
    ```
*   **Mongoose Schema Constraints**: Do not define Better Auth user references as Mongoose `Schema.Types.ObjectId` unless you deliberately change Better Auth's ID-generation strategy. Better Auth's core user and session schemas use string IDs.
    *   **TypeScript representation**:
        ```typescript
        interface Order {
          _id: Types.ObjectId;
          userId: string;
        }
        ```
*   **Mongoose Connection**: Always call `await connectMongoose()` (imported from `@/lib/mongoose`) inside repositories, services, or a shared model helper before executing any domain queries or database operations. Do not assume active connection.

---

## 6. Validation & Error Handling Rules
*   **Egyptian Phone Normalization**: Always validate and normalize Egyptian mobile numbers using `normalizeEgyptianPhone()` (from `@/lib/phone`) to standard E.164 (`+20...`) format. Reject formatting mismatches.
*   **Error Disclosure Restrictions**: Under no circumstances should database internals, stack traces, environment variables, cookie values, reset tokens, or raw provider errors reach client query outputs. Always sanitize exceptions using `errorToApiResponse()` or similar mapping.

---

## 7. HTTP & API Protocol Contracts
*   **Server Actions**: Since Server Actions do not return HTTP status codes, they must always return the typed `ActionResult<T>` structure using `actionSuccess()` or `actionFailure()` (imported from `@/lib/results/action-result`).
*   **Route Handlers**: Wrap all custom API Route Handlers (GET, POST, PUT, DELETE) with the `withApiHandler()` (from `@/lib/http/with-api-handler`) higher-order function, and use the `apiSuccess()` or `apiFailure()` (from `@/lib/http/api-response`) helpers to structure responses.
*   **Better Auth Exceptions**: Do not wrap Better Auth's native `/api/auth/[...all]` endpoint routes with `withApiHandler` or the `apiSuccess`/`apiFailure` wrappers. Better Auth clients expect Better Auth's native response formats.


