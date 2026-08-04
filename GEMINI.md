# GEMINI.md

## Gemini CLI Instructions for Afnan

`AGENTS.md` is the primary source of truth for product scope, architecture, domain rules, security, caching, testing, and team ownership. Read it before making any change.

---

## 1. Required Startup Sequence

At the beginning of every task:

1. Read `AGENTS.md`.
2. Inspect `package.json` and the active lockfile.
3. Inspect the relevant route under `src/app`.
4. Inspect the relevant feature module under `src/modules`.
5. Inspect related Zod schemas, Mongoose models, DTOs, and tests.
6. Determine whether the request belongs to MVP scope.
7. Identify the owning member/module.
8. State a concise implementation plan.

Do not start coding from the prompt alone.

---

## 2. Project Context

Afnan is an Egypt-only handmade e-commerce MVP.

Key decisions:

- Next.js App Router
- TypeScript strict mode
- MongoDB Atlas with Mongoose
- Better Auth
- Tailwind CSS
- Cloudinary/S3 images
- EGP only
- Cash on delivery only
- Egyptian governorate shipping
- Manual WhatsApp confirmation
- Admin email alerts
- No internal notification center
- No online payments
- No international shipping
- No microservices
- No reviews in MVP

Main flow:

```text
Browse
→ Add to cart
→ Checkout
→ Create cash order
→ Email admin
→ Admin contacts customer on WhatsApp
→ Admin confirms and processes order
```

---

## 3. Gemini Working Style

When implementing:

- Explain affected modules.
- Mention authorization and security impact.
- Mention database/index impact.
- Mention cache impact.
- Mention tests that must change.
- Prefer incremental edits.
- Avoid rewriting entire files unless necessary.
- Avoid unrelated cleanup.
- Follow existing naming and patterns.
- Reuse repository utilities before adding abstractions.

When reviewing code:

1. Correctness and security
2. Data consistency and transactions
3. Caching
4. Performance
5. Maintainability

Reference exact files and symbols. Separate confirmed problems from optional improvements.

---

## 4. Terminal Discipline

Before commands:

- Inspect `package.json`.
- Use the repository package manager.
- Prefer targeted commands before full suites.
- Avoid destructive commands.
- Never print secrets or complete environment values.
- Never run seed scripts against production.

Safe examples:

```bash
git status
git diff
pnpm lint
pnpm typecheck
pnpm test -- <target>
pnpm build
```

Do not use destructive commands such as `git reset --hard`, `git clean -fd`, or broad deletion without explicit user approval.

---

## 5. Code Generation Rules

### TypeScript

- Use strict types.
- Avoid `any`.
- Validate unknown data.
- Prefer discriminated unions.
- Keep server-only code out of client bundles.

### Next.js and React

- Server Components by default.
- Add `"use client"` only for actual interactivity.
- Use Server Actions for UI-only mutations.
- Use Route Handlers for auth, uploads, search suggestions, and health checks.
- Do not fetch internal Route Handlers from Server Components.
- Keep pages thin.
- Return serializable DTOs.

### Forms

- Validate with Zod on the server.
- Client validation improves UX but never replaces server validation.
- Return consistent field errors.
- Prevent duplicate submissions.
- Include loading, success, and failure states.

### Database

- Use repositories and services.
- Use projections and pagination.
- Use `.lean()` when appropriate.
- Use unique indexes for identifiers.
- Use transactions for order creation.
- Use conditional stock updates.
- Never trust client price, role, stock, or totals.

---

## 6. Security Checklist

For every write operation, verify:

- Is the user authenticated?
- Is email verification required?
- Is the role authorized?
- Does the user own the resource?
- Is input validated and normalized?
- Are mutable fields allow-listed?
- Could this cause IDOR or NoSQL injection?
- Is rate limiting needed?
- Is sensitive data logged?
- Is cache invalidation required?

For uploads, verify MIME type, extension, size, count, storage ownership, returned metadata, allowed formats, and authorized destination.

---

## 7. Cache Checklist

Public catalog reads may be cached. Private data must not use shared caching.

Before changing a write path, check these tags:

```text
home
products
product:{id}
categories
category:{id}
shipping-rates
store-settings
```

Do not cache arbitrary search/filter combinations without a measured reason.

---

## 8. Domain Checklist

### Products

- Ready-made requires stock.
- Made-to-order requires preparation time.
- Archived products are hidden publicly.
- Historical orders keep snapshots.
- Money uses integer EGP minor units.

### Cart

- Revalidate product data.
- Never trust displayed/stored price.
- Enforce ownership and quantity limits.

### Checkout

- Require verified user.
- Recalculate totals and shipping.
- Validate Egyptian governorate.
- Use idempotency token.
- Prevent negative stock.
- Create immutable snapshots.
- Clear cart only after success.
- Send email only after commit.

### Orders

- Enforce allowed transitions.
- Preserve status history.
- Admin owns operational updates.
- Customer reads only own orders.

### WhatsApp

- Normalize Egyptian number.
- Encode message.
- Do not mark contacted automatically.
- Admin explicitly records the result.

### Custom requests

- Verify upload ownership.
- Keep internal notes private.
- Use simplified MVP statuses.

### Image enhancement

- Preserve original.
- Enhancement is optional.
- Admin approves enhanced source.
- Fall back to original.
- Use light-gray UI background.
- Never change actual product colors.

---

## 9. Testing Expectations

Every feature change should include the smallest relevant set of:

- Unit tests for domain rules
- Integration tests for auth/database/actions
- E2E tests for critical journeys

Do not say tests pass unless commands were run successfully. If a test cannot run, explain why.

---

## 10. Reporting After Changes

Use this format:

### Changed

- Files modified
- Main behavior added or changed

### Decisions

- Security
- Data model
- Cache invalidation
- Transaction behavior
- Scope decisions

### Verification

- Commands run
- Tests passed
- Build result

### Remaining risks

- Known limitations
- Follow-up work
- External service requirements

Keep the report factual.

---

## 11. Team Ownership

### Member 1

- Authentication
- Storefront
- Discovery
- Public catalog queries
- SEO
- Public caching

### Member 2

- Profile and addresses
- Cart and wishlist
- Checkout and order creation
- Customer orders
- Custom-request submission
- Upload flow

### Member 3

- Admin shell
- Product/category admin forms
- Catalog mutations
- Image-enhancement approval
- Order operations
- WhatsApp confirmation
- Custom-request admin
- Egypt shipping
- Admin emails
- Settings
- Deployment

Mention cross-owner impact before modifying shared contracts.

---

## 12. Scope Guard

When a request introduces a post-MVP feature:

1. Do not silently implement it.
2. Explain that it is outside current scope.
3. Suggest the smallest MVP-compatible alternative.
4. Proceed only after explicit confirmation.

Examples:

- Payment gateway → keep cash on delivery
- Push notifications → keep admin email
- International shipping → keep Egypt governorates
- Reviews → postpone
- Advanced AI image tools → keep provider background-removal preview
- Microservices → keep modular monolith
